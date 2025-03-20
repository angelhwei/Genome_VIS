import pandas as pd

# 定义反馈到分数的映射
feedback_to_score = {
    '非常同意': 5,
    '同意': 4,
    '普通': 3,
    '不同意': 2,
    '非常不同意': 1
}

# 读取 CSV 文件
df = pd.read_csv('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/thesis_plot/SUS_data.csv', header=None)

# 将文本形式的反馈转换为数字形式
for i in range(10):
    df[i] = df[i].map(feedback_to_score)

# 初始化 SUS 分数为 0
df['SUS'] = 0

# 计算每一项的分数
for i in range(10):
    if (i + 1) % 2 == 0:
        df['SUS'] += 5 - df[i]
    else:
        df['SUS'] += df[i] - 1

# 将总分乘以 2.5 得到 SUS 分数
df['SUS'] = df['SUS'] * 2.5

# 计算平均 SUS 分数
average_SUS = df['SUS'].mean()

# 新增各題人數統計與平均分數
for i in range(10):
    print(f"Question {i+1}:")
    print("Count:")
    print(df[i].value_counts())
    if (i + 1) % 2 == 0:  # 偶数题
        adjusted_score = 5 - df[i]
    else:  # 基数题
        adjusted_score = df[i] - 1
    print("Average adjusted score: ", adjusted_score.mean())

print(df)
print("Average SUS Score: ", average_SUS)