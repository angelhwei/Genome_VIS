import pandas as pd

# 讀取CSV文件
df_clean = pd.read_csv('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_clean.csv', header=None)
df_length_clean = pd.read_csv('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_Length_clean2.csv', header=None)

# 將Genomic_length_clean.csv轉換為字典，以便快速查找
length_dict = df_length_clean.set_index(0)[1].to_dict()

# 遍歷每一行
for index, row in df_clean.iterrows():
    # 檢查row[1]和row[2]是否在範圍內
    if row[0] in length_dict and (row[1] > length_dict[row[0]] or row[2] > length_dict[row[0]]):
        # 如果不在範圍內，刪除該行
        df_clean.drop(index, inplace=True)

# 保存新的DataFrame為CSV文件
df_clean.to_csv('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/new_Genomic_clean.csv', index=False, header=False)