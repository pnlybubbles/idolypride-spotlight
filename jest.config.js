/* global module */

/** @type { import('@jest/types').Config.InitialOptions } */
module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '~~/(.*)$': '<rootDir>/$1',
  },
}
