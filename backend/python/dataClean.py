import csv

input_file_path1 = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_Length.csv'
output_file_path = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_Length_clean2.csv'

rows = []

with open(input_file_path1, 'r') as f:
    reader = csv.reader(f, delimiter=' ')
    for i, row in enumerate(reader):
        # Break the loop after 10 lines
        if i >= 10:
            break

        # Remove double quotes from the data
        row = [x.replace('"', '') for x in row]
        row[1] = int(float(row[1]) / 10)
        rows.append(row)

with open(output_file_path, 'w', newline='') as f1:
    writer = csv.writer(f1, quoting=csv.QUOTE_NONE, escapechar='\\')
    writer.writerows(rows)