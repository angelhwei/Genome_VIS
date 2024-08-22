import pandas as pd
import json

# 讀取JSON文件
with open('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/gene_data_general_group.json') as f:
    gene_data = json.load(f)

# 獲取基因列表
gene_list = [gene['name'] for chromosome in gene_data for gene in chromosome['gene']]

# 讀取CSV文件，將 header 設置為 None
df_clean = pd.read_csv('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/exp_data_general_group.csv', header=None)

# 過濾出存在於基因列表的行，並保留第一行
df_clean = pd.concat([df_clean.iloc[:1], df_clean.iloc[1:][df_clean.iloc[1:, 0].isin(gene_list)]])

# 保存新的DataFrame為CSV文件
df_clean.to_csv('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/new_Genomic_clean.csv', index=False, header=False)