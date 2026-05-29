import 'package:flutter/material.dart';

class CommissionTier {
  int minQty;
  int? maxQty;
  double percent;

  CommissionTier({required this.minQty, this.maxQty, required this.percent});
}

class SimulationDashboardScreen extends StatefulWidget {
  const SimulationDashboardScreen({super.key});

  @override
  _SimulationDashboardScreenState createState() => _SimulationDashboardScreenState();
}

class _SimulationDashboardScreenState extends State<SimulationDashboardScreen> {
  double _volumeIncrement = 10.0;
  double _cannibalizationRisk = 2.0;
  
  final List<CommissionTier> _tiers = [
    CommissionTier(minQty: 0, maxQty: 100, percent: 5.0),
  ];

  void _addTier() {
    setState(() {
      int nextMin = _tiers.isNotEmpty ? (_tiers.last.maxQty ?? 0) + 1 : 0;
      _tiers.add(CommissionTier(minQty: nextMin, maxQty: nextMin + 100, percent: 0.0));
    });
  }

  void _runSimulation() {
    // In production: ref.read(simulationProvider.notifier).runWhatIfAnalysis(...)
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Running Server-Side Simulation...')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('What-If Scenario Simulation'),
        backgroundColor: Colors.blueGrey[900],
        foregroundColor: Colors.white,
      ),
      body: Row(
        children: [
          // LEFT PANEL: CONTROLS & FORMS
          Expanded(
            flex: 2,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Market Assumptions', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 16),
                  const Text('Expected Volume Increment (%)'),
                  Slider(
                    value: _volumeIncrement,
                    min: -50,
                    max: 200,
                    divisions: 250,
                    label: '${_volumeIncrement.toStringAsFixed(1)}%',
                    onChanged: (val) => setState(() => _volumeIncrement = val),
                  ),
                  const SizedBox(height: 16),
                  const Text('Cannibalization Risk (%)'),
                  Slider(
                    value: _cannibalizationRisk,
                    min: 0,
                    max: 100,
                    divisions: 100,
                    label: '${_cannibalizationRisk.toStringAsFixed(1)}%',
                    activeColor: Colors.redAccent,
                    onChanged: (val) => setState(() => _cannibalizationRisk = val),
                  ),
                  const Divider(height: 48),
                  
                  // COMMISSION TIER BUILDER
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Dynamic Commission Tiers', style: Theme.of(context).textTheme.titleLarge),
                      ElevatedButton.icon(
                        onPressed: _addTier,
                        icon: const Icon(Icons.add),
                        label: const Text('Add Tier'),
                      )
                    ],
                  ),
                  const SizedBox(height: 16),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _tiers.length,
                    itemBuilder: (context, index) {
                      final tier = _tiers[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8.0),
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            children: [
                              Expanded(child: TextFormField(
                                initialValue: tier.minQty.toString(),
                                decoration: const InputDecoration(labelText: 'Min Qty'),
                                keyboardType: TextInputType.number,
                                onChanged: (val) => tier.minQty = int.tryParse(val) ?? 0,
                              )),
                              const SizedBox(width: 16),
                              Expanded(child: TextFormField(
                                initialValue: tier.maxQty?.toString() ?? '',
                                decoration: const InputDecoration(labelText: 'Max Qty (Empty for ∞)'),
                                keyboardType: TextInputType.number,
                                onChanged: (val) => tier.maxQty = int.tryParse(val),
                              )),
                              const SizedBox(width: 16),
                              Expanded(child: TextFormField(
                                initialValue: tier.percent.toString(),
                                decoration: const InputDecoration(labelText: 'Commission %'),
                                keyboardType: TextInputType.number,
                                onChanged: (val) => tier.percent = double.tryParse(val) ?? 0.0,
                              )),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _runSimulation,
                      child: const Text('Simulate ROI & Margins', style: TextStyle(fontSize: 18)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const VerticalDivider(width: 1),

          // RIGHT PANEL: VISUAL DASHBOARD & RESULTS
          Expanded(
            flex: 3,
            child: Container(
              color: Colors.grey[50],
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Simulation Results', style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      _buildMetricCard('Projected Net Profit', '\$124,500', Colors.green),
                      _buildMetricCard('Commission Cost', '\$32,100', Colors.orange),
                      _buildMetricCard('Net Margin', '24.5%', Colors.blue),
                    ],
                  ),
                  const Spacer(),
                  // Placeholder for Charting Library (e.g., fl_chart)
                  Center(
                    child: Container(
                      height: 300,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: const Center(
                        child: Text(
                          '[ Waterfall Chart: Revenue -> COGS -> Commission -> Profit ]\n(Integrate fl_chart here)',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    ),
                  ),
                  const Spacer(),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, Color color) {
    return Expanded(
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              Text(title, style: const TextStyle(fontSize: 14, color: Colors.grey)),
              const SizedBox(height: 8),
              Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
        ),
      ),
    );
  }
}