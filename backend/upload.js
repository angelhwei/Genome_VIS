const fs = require('fs');
const mongoose = require('mongoose');
const { GeneData, MutationData, GeneDataSchema } = require('./model/data.model');

mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });

fs.readFile('newData3.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const jsonData = JSON.parse(data);

  jsonData.forEach(row => {
    const geneData = new GeneData({
      name: row.name,
      start: row.start,
      end: row.end,
    });

    const mutationData = new MutationData({
      BP: row.BP,
      pRef: row.pRef,
      pNuc: row.pNuc,
      p: row.p,
      muValues: row.muValues,
    });

    const geneDataSchema = new GeneDataSchema({
      chromosome: row.chromosome,
      length: row.length,
      gene: [geneData],
      mutation: [mutationData],
    });

    geneDataSchema.save();
  });
});