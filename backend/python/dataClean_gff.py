import csv

input_file_path1 = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic.gff'
output_file_path = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_clean.csv'

rows = []

with open(input_file_path1, 'r') as f:
    for i, line in enumerate(f):
        # Skip the first 8 lines
        if i < 8:
            continue

        # Split the line by tabs (GFF files are tab-delimited)
        row = line.strip().split('\t')
        # Only append the row if it has at least three elements and the third element is "gene"
        if len(row) >= 9 and row[2] == "gene":
            # Split the ninth element by semicolons and keep only the part that starts with "Name="
            name_field = next((x for x in row[8].split(';') if x.startswith('Name=')), '')
            # Remove "Name=" from the name field
            row[8] = name_field.replace('Name=', '')
            # Remove the second, sixth, seventh, and eighth elements from the row
            row = [x for j, x in enumerate(row) if j not in [1, 2, 5, 6, 7]]
            rows.append(row)

with open(output_file_path, 'w', newline='') as f1:
    writer = csv.writer(f1)
    writer.writerows(rows)