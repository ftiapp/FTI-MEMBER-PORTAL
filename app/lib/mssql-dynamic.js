// This file provides a dynamic import wrapper for mssql

let sql = null;

const types = {
  NVarChar: Symbol('NVarChar'),
  VarChar: Symbol('VarChar'),
  Int: Symbol('Int'),
  Float: Symbol('Float'),
  Bit: Symbol('Bit'),
  DateTime: Symbol('DateTime'),
};

const handler = {
  get(target, prop) {
    if (types[prop]) {
      return types[prop];
    }
    if (prop === 'connect') {
      return async (config) => {
        if (!sql) {
          sql = (await import('mssql')).default;
        }
        return sql.connect(config);
      };
    }
    if (prop === 'default') {
      return target;
    }
    return undefined;
  },
};

const proxy = new Proxy({}, handler);

export default proxy;
export const { NVarChar, VarChar, Int, Float, Bit, DateTime } = types;
