const flattenStyles = (features) => {
  const result = {};

  _.keys(features.driveTypes).forEach(driveType => {
    _.values(features.driveTypes[driveType]).forEach(({cabSize, displayName, trims}) => {
      trims.forEach(({mmcpeg, msrp, name, styleId}) => {
        result[styleId] = {driveType, cabSize, bodyType: displayName, mmcpeg, msrp, trim: name, styleId};
      });
    });
  });

  return result;
};

const flattenMatrix = (matrix) => {
  const result = {};

  _.values(matrix.table).forEach(value => {
    _.values(value).forEach(value => {
      value.forEach(value => {
        result[value.styleId] = value;
      });
    });
  });

  return result;
};

const mergeStyles = (matrix, features) => {
  const featureStyles = flattenStyles(features);
  const matrixStyles = flattenMatrix(matrix);

  return _.keys(matrixStyles).map(styleId => {
    return _.assign({}, matrixStyles[styleId], featureStyles[styleId]);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const promises = [
    fetch('matrix.json').then(res => res.json()),
    fetch('config.json').then(res => res.json()),
    fetch('model.json').then(res => res.json()),
    fetch('features.json').then(res => res.json()),
    fetch('capability.json').then(res => res.json())
  ];

  Promise.all(promises)
    .then(([matrix, config, model, features, capability]) => {
      const engines = config.modelMatrix.engine
        .reduce((hash, engine) => {
          hash[engine.id] = engine;
          return hash;
        }, {});
      const styles = mergeStyles(matrix, features);

      let html = '';

      _.values(styles).forEach(style => {
        const engine = engines[style.engine];

        const template = `
          <div>
            <div>Style: ${style.styleId}</div>
            <div>Trim: ${style.trim}</div>
            <div>Body Type: ${style.bodyType}</div>
            <div>Drive Type: ${style.driveType}</div>
            <div>Engine: ${engine.description}</div>
            <div>Price: ${style.msrp}</div>
          </div>
          <hr />
        `;

        html += template;
      });

      document.body.innerHTML = html;
    });
});
