# VariaVisio

## What is VariaVisio
VariaVisio is a genomic visualization system designed for population genomics research. It helps biology researchers work more efficiently by providing intuitive visualizations of complex genomic data. The system is divided into three integrated parts: Chromosome/Scaffold View, Sequence View, and Gene Expression View.

## Features
- Chromosome/Scaffold View
  - Chromosome/Scaffold View displays the entire genome in a single view. 
  - Through this bar chart, users can see the distribution of variations across the genome.
  - Users can click on a specific region to view detailed information about that region.
- Sequence View
  - Sequence View displays the whole gene sequence of a specific region.
  - Users can see the gene and non-coding gene of the region and the variations in the sequence.
  - Users can hover on a specific variation or gene to view detailed information, such as the position, variation degree or the gene name.
- Gene Expression View
  - Gene Expression View displays the gene expression level of a specific gene.
  - Users can see the gene expression level of the gene in different conditions.
  - Users can hover on a specific gene to view detailed information, such as the gene name or the gene expression level.

## How to use VariaVisio

### Setup Instructions
1. Clone the repository
```bash
git clone https://github.com/angelhwei/Genome_VIS.git
cd app
```
2. Install dependencies
```bash
npm install
```
3. Build the production version
```bash
ng build
```
4. Run the web
```bash
ng serve
```

### User Guide
Loading Data
   - Place your json file url in the `data.service.ts`, `gene-exp-data.service.ts`, and `map-data.service.ts` files.


## Technologies
- Frontend: Angular, D3.js, RxJS
- Backend: Python