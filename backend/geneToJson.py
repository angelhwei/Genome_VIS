import json
import re
import csv

input_file_path1 = '/Users/angel/Desktop/LAB/gene_code/gene/backEndPython/Leptoria_gene_list.csv'
input_file_path2 = '/Users/angel/Desktop/LAB/gene_code/gene/backEndPython/Leptoria_scaffold_length.csv'
output_file_path = '/Users/angel/Desktop/LAB/gene_code/gene/backEndPython/newData3.json'
symbols_to_remove = ["\n", '"', ";"]

def custom_split(sepr_list, str_to_split):
        # create regular expression dynamically
        regular_exp = '|'.join(map(re.escape, sepr_list))
        return re.split(regular_exp, str_to_split)

# 读取input_file_path2文件，将chromosome和length存储到字典中
length_dict = {}
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
            row[4] = row[4].replace(symbol, "")

        length = length_dict.get(row[0], 0)  # 如果找不到对应的chromosome，length默认为0
        gene = {
            "name": row[4],
            "start": int(row[2]),
            "end": int(row[3])
        }
        mutation = {
            "BP": 0,
            "popId": 0,
            "pNuc": 0,
            "p": 0,
            "muValues": 0
        }
        if not output_data or output_data[-1]["chromosome"] != row[0]:
            output_data.append({
                "chromosome": row[0],
                "length": length,
                "gene": [],
                "mutation": [mutation] 
            })

        # for line2 in lines2:
        #     row2 = line2.split(' ')
        #     if row[0].lower() == row2[0].lower():
        #         print(row2[0])
        #         output_data[0]["length"] = int(row2[1])
                
        if output_data:
            output_data[-1]["gene"].append(gene)
        next(lines, None)



for data in output_data:
    data["gene"] = sorted(data["gene"], key=lambda x: x['start'])

with open(output_file_path, 'w') as f:
    json.dump(output_data, f)