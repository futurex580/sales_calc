import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async predictProgramResult(draftProgram: any, companyId: string) {
    // 1. Ekstraksi Data Historis (Belajar dari masa lalu)
    const programs = await this.prisma.incentiveProgram.findMany({
      where: { companyId },
      include: { tiers: true },
    });

    const trainingData = [];
    for (const p of programs) {
      // Hitung total revenue riil dari program ini
      const salesAggr = await this.prisma.salesRecord.aggregate({
        where: {
          companyId,
          soldAt: { gte: p.startDate, lte: p.endDate },
        },
        _sum: { totalValue: true }
      });
      const actualRevenue = Number(salesAggr._sum.totalValue || 0);
      
      // Ekstraksi Variabel/Fitur (X1, X2)
      const durationDays = (p.endDate.getTime() - p.startDate.getTime()) / (1000 * 3600 * 24) || 1;
      const maxReward = p.tiers.length > 0 ? Math.max(...p.tiers.map(t => Number(t.rewardValue))) : 0;
      
      trainingData.push({ durationDays, maxReward, actualRevenue });
    }

    // AI butuh minimal 2 data untuk membentuk pola regresi
    if (trainingData.length < 2) {
      return {
        estimatedRevenue: null,
        confidenceScore: 0,
        message: "AI belum siap. Butuh minimal 2 program historis untuk mengenali pola penjualan perusahaan Anda."
      };
    }

    // 2. K-Nearest Neighbors (KNN) Machine Learning Algorithm
    const draftDuration = Number(draftProgram.durationDays) || 30;
    const draftReward = Number(draftProgram.rewardValue) || 5;

    // Hitung jarak (Euclidean Distance) dari draf ke titik data historis
    trainingData.forEach(d => {
       // Normalisasi bobot fitur
       const diffDuration = (d.durationDays - draftDuration) / 30; 
       const diffReward = (d.maxReward - draftReward) / 5;
       d.distance = Math.sqrt(diffDuration * diffDuration + diffReward * diffReward);
    });

    // Ambil 3 tetangga terdekat (polanya paling mirip)
    trainingData.sort((a, b) => a.distance - b.distance);
    const nearest = trainingData.slice(0, 3);
    
    // Prediksi dengan Inverse Distance Weighting (Makin mirip, bobot makin besar)
    let totalWeight = 0;
    let weightedRevenue = 0;
    nearest.forEach(n => {
       const weight = 1 / (n.distance + 0.001); // hindari dibagi nol
       totalWeight += weight;
       weightedRevenue += n.actualRevenue * weight;
    });

    const baseEstimatedRevenue = weightedRevenue / totalWeight;

    // 3. Proyeksi Ekstrapolasi (Extrapolation)
    // Membuat prediksi dinamis secara proporsional jika input lebih besar/kecil dari histori
    const avgNearestDuration = nearest.reduce((sum, n) => sum + n.durationDays, 0) / nearest.length;
    const avgNearestReward = nearest.reduce((sum, n) => sum + n.maxReward, 0) / nearest.length;
    
    const durationRatio = avgNearestDuration > 0 ? (draftDuration / avgNearestDuration) : 1;
    const rewardRatio = avgNearestReward > 0 ? (draftReward / avgNearestReward) : 1;
    
    // Bobot: Durasi mempengaruhi omset 70%, besaran persentase komisi mempengaruhi 30%
    const projectionMultiplier = (durationRatio * 0.7) + (rewardRatio * 0.3);

    const estimatedRevenue = baseEstimatedRevenue * projectionMultiplier;
    const avgDistance = nearest.reduce((sum, n) => sum + n.distance, 0) / nearest.length;
    const confidenceScore = Math.max(0, 100 - (avgDistance * 20)); // Skala akurasi 0-100%

    return {
       estimatedRevenue,
       confidenceScore: Math.round(confidenceScore),
       message: `Prediksi ini dihasilkan dengan memadukan ${nearest.length} data program historis dan proyeksi linear.`
    };
  }
}