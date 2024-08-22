import json
import re
import csv

input_file_path1 = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_clean2.csv'
input_file_path2 = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_Length_clean2.csv'
input_file_path3 = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/mutations_general_group.csv'
output_file_path = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/gene_data_general_group_new.json'
symbols_to_remove = ["\n", '"', ";", " "]

def custom_split(sepr_list, str_to_split):
        # create regular expression dynamically
        regular_exp = '|'.join(map(re.escape, sepr_list))
        return re.split(regular_exp, str_to_split)

def check_overlap(gene, genes):
    for g in genes:
        if not (gene['end'] < g['start'] or gene['start'] > g['end']):
            return True
    return False

def generate_data():
# 读取input_file_path2文件，将chromosome和length存储到字典中
    length_dict = {}
    mutation_dict = {}

    with open(input_file_path3, 'r') as f3:
        reader = csv.reader(f3)
        for row in reader:
            chromosome = row[0]
            BP = int(row[1])
            pRef = row[2]
            pNuc_values = row[3].split(',')
            # p_values = [float(p) for p in row[4].split(',')]
            muValues = [float(mu) for mu in row[4].split(',')]
            if chromosome not in mutation_dict:
                mutation_dict[chromosome] = []
            for pNuc, mu in zip(pNuc_values, muValues):
                mutation_dict[chromosome].append({
                    "BP": BP,
                    "pRef": pRef, 
                    "pNuc": pNuc,
                    "muValues": mu
                })
               

    with open(input_file_path2, 'r') as f2:
        for line in f2:
            row = line.strip().split(',')
            length_dict[row[0]] = int(row[1])

    output_data = []

    with open(input_file_path1, 'r') as f1:
        lines = iter(f1)

        for line in lines:
            row = line.strip().split(',')
            length = length_dict.get(row[0], 0)  # 如果找不到对应的chromosome，length默认为0
            if length == 0:
                continue
            gene = {
                "name": row[3],
                "start": int(row[1]),
                "end": int(row[2])
            }
            mutation = mutation_dict.get(row[0], [])
            if not output_data or output_data[-1]["chromosome"] != row[0]:
                output_data.append({
                    "chromosome": row[0],
                    "length": length,
                    "gene": [],
                    "mutation": mutation
                })

            # Check if the gene overlaps with any existing genes
            if not check_overlap(gene, output_data[-1]["gene"]):
                output_data[-1]["gene"].append(gene)


    for data in output_data:
        data["gene"] = sorted(data["gene"], key=lambda x: x['start'])
    return output_data

with open(output_file_path, 'w') as f:
    json.dump(generate_data(), f)