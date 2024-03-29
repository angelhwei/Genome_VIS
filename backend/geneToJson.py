import json
import re
import csv

input_file_path1 = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/Leptoria_gene_list.csv'
input_file_path2 = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/Leptoria_scaffold_length.csv'
input_file_path3 = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/new_mutation.csv'
output_file_path = '/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/newData3.json'
symbols_to_remove = ["\n", '"', ";", " "]

def custom_split(sepr_list, str_to_split):
        # create regular expression dynamically
        regular_exp = '|'.join(map(re.escape, sepr_list))
        return re.split(regular_exp, str_to_split)

def generate_data():
# 读取input_file_path2文件，将chromosome和length存储到字典中
    length_dict = {}
    mutation_dict = {}

    with open(input_file_path3, 'r') as f3:
        reader = csv.reader(f3)
        for row in reader:
            chromosome = row[0]
            BP = int(row[1].split(':')[1])
            pRef = row[2]
            pNuc_values = row[3].split(',')
            p_values = [float(p) for p in row[4].split(',')]
            muValues = [float(mu) for mu in row[4].split(',')]
            if chromosome not in mutation_dict:
                mutation_dict[chromosome] = []
            for pNuc, p, mu in zip(pNuc_values, p_values, muValues):
                mutation_dict[chromosome].append({
                    "BP": BP,
                    "pRef": pRef, 
                    "pNuc": pNuc,
                    "p": p,
                    "muValues": mu
                })
               

    with open(input_file_path2, 'r') as f2:
        for line in f2:
            row = line.split(' ')
            length_dict[row[0]] = int(row[1])

    output_data = []

    with open(input_file_path1, 'r') as f1:
        lines = iter(f1)

        for line in lines:
            row = line.split('\t')
            for symbol in symbols_to_remove:
                row[0] = row[0].replace(symbol,"")
                row[4] = row[4].replace(symbol,"")

            length = length_dict.get(row[0], 0)  # 如果找不到对应的chromosome，length默认为0
            gene = {
                "name": row[4],
                "start": int(row[2]),
                "end": int(row[3])
            }
            mutation = mutation_dict.get(row[0], [])
            if not output_data or output_data[-1]["chromosome"] != row[0]:
                output_data.append({
                    "chromosome": row[0],
                    "length": length,
                    "gene": [],
                    "mutation": mutation
                })

    
            if output_data:
                output_data[-1]["gene"].append(gene)
            next(lines, None)



    for data in output_data:
        data["gene"] = sorted(data["gene"], key=lambda x: x['start'])
    return output_data

with open(output_file_path, 'w') as f:
    json.dump(generate_data(), f)