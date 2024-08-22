import csv
import random

def check_overlap(gene, genes):
    for g in genes:
        if not (gene['end'] < g['start'] or gene['start'] > g['end']):
            return False
    return True

# Open the Genomic_clean.csv file and read the fourth column
with open('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_clean2.csv', 'r') as f1:
    reader = csv.reader(f1)
    gene_data = [{'name': row[3], 'start': int(row[1]), 'end': int(row[2])} for row in reader]

# Remove overlapping genes
non_overlapping_genes = []
for gene in gene_data:
    if check_overlap(gene, non_overlapping_genes):
        non_overlapping_genes.append(gene)

# Divide the genome into unequal segments
segments = []
split_points = [0, len(non_overlapping_genes)//4, len(non_overlapping_genes)//2, len(non_overlapping_genes)*3//4, len(non_overlapping_genes)]
for i in range(4):
    segments.append(non_overlapping_genes[split_points[i]:split_points[i+1]])

# Randomly select genes from each segment
selected_genes = []
for segment in segments:
    num_genes = 30 if len(segment) >= 30 else len(segment)
    selected_genes.extend(random.sample(segment, num_genes))

# Prepare the header for the new dataset
data = [['Gene', 'Spr_Gentle', 'Sum_Gentle', 'Aut_Gentle', 'Win_Gentle', 'Spr_Steep', 'Sum_Steep', 'Aut_Steep', 'Win_Steep']]

# For each gene, create a new row with random values for each column
for gene in selected_genes:
    row = [gene['name']]
    for _ in range(8):  # 8 columns of data
        row.append(round(random.uniform(-1, 1), 4))  # generate a random float between -1 and 1
    data.append(row)

# Write the new dataset to a new CSV file
with open('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/exp_data_general_group.csv', 'w', newline='') as f3:
    writer = csv.writer(f3)
    writer.writerows(data)