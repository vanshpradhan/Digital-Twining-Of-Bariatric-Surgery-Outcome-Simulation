# Sample Datasets

This directory is for storing training datasets and sample data.

## Recommended Datasets

### Imaging Datasets (for segmentation training)

1. **TCIA Abdominal CT**
   - URL: https://www.cancerimagingarchive.net/
   - Format: DICOM
   - Use: CT-based stomach segmentation

2. **CHAOS Challenge**
   - URL: https://chaos.grand-challenge.org/
   - Format: DICOM + NIfTI
   - Use: Multi-organ MRI segmentation

3. **Medical Segmentation Decathlon**
   - URL: http://medicaldecathlon.com/
   - Format: NIfTI
   - Use: General medical segmentation

### Biomechanical Data

Store tissue property data here:
- Wall thickness measurements
- Stress-strain curves
- Elastic modulus values

### Surgical Outcome Data

For training leak risk prediction:
- Stapler sizes used
- Leak occurrences
- Postoperative complications

## Directory Structure

```
datasets/
├── sample/           # Generated sample data
│   ├── patients.json
│   ├── meshes/
│   └── simulation_results/
├── training/         # Training datasets
│   ├── ct_scans/
│   ├── mri_scans/
│   └── segmentation_masks/
├── validation/       # Validation datasets
└── README.md
```

## Generating Sample Data

Run the dummy data loader script:

```bash
python scripts/dummy_data_loader.py
```
