// Mock file for build time - actual mssql is loaded at runtime

const mockTypes = {
  NVarChar: 'NVarChar',
  VarChar: 'VarChar',
  Int: 'Int',
  Float: 'Float',
  Bit: 'Bit',
  DateTime: 'DateTime',
};

const mock = {
  connect: async () => {
    throw new Error('MSSQL mock - should not be called during build');
  },
  ...mockTypes,
};

export default mock;
