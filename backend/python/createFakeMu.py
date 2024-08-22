import pandas as pd
import random
import csv

# Load the CSV file
df = pd.read_csv('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/Genomic_Length_clean2.csv', header=None)

# Create a dictionary to store the length data for each chromosome
data = df.set_index(0)[1].to_dict()

# Create a dictionary to store the mutation data for each chromosome
mutations = {}

# Define the ATCG bases
bases = ['A', 'T', 'C', 'G']

# Iterate over the parsed data
for chr_name, length in data.items():
    # Initialize a new list for this chromosome
    mutations[chr_name] = []

    # Generate a random number of mutations for each chromosome
    num_mutations = random.randint(1, 200)  # adjust the range as needed

    # Generate 100 mutations for each chromosome
    for _ in range(num_mutations):
        # Generate a random base position within the length of the chromosome
        base_position = random.randint(1, length)

        # Generate a random reference ATCG
        ref_atcg = random.choice(bases)

        # Generate a random alternate ATCG different from the reference
        alt_atcg = random.choice([base for base in bases if base != ref_atcg])

        # Generate a random muValue between 0 and 1 and round it to 5 decimal places
        mu_value = round(random.random(), 5)

        # Append the new mutation data to the list for this chromosome
        mutations[chr_name].append([chr_name, base_position, ref_atcg, alt_atcg, mu_value])

    # Sort the mutations for this chromosome by the base position
    mutations[chr_name] = sorted(mutations[chr_name], key=lambda x: x[1])

# Combine the sorted lists of mutations into a single list
sorted_mutations = [mutation for chr in mutations.values() for mutation in chr]

# Convert the list to a CSV format
with open('/Users/angel/Desktop/LAB/genome_VIS/Genome_VIS/backend/python/mutations_general_group.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(sorted_mutations)