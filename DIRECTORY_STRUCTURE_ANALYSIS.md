# Directory Structure Analysis

## Directory Map

### Root Level
- `/NeoSnipe` - Main project directory
- `/src` - Source code directories (multiple instances)
- `/tests` - Test directories (multiple instances)
- `/market_analysis` - Market analysis related code
- `/visual_design` - Visual design and sacred geometry patterns

### Key Directories
#### Source Code (/src)
- `/components` - React components
- `/hooks` - Custom React hooks
- `/utils` - Utility functions
- `/types` - TypeScript type definitions
- `/market_analysis` - Market analysis functionality
- `/shaders` - WebGL shader code
- `/workers` - Web workers for pattern detection

#### Configuration
- Root level configuration files (package.json, tsconfig.json, etc.)
- Build and bundling configuration files
- Testing configuration files

#### Testing (/tests)
- Unit tests
- Integration tests
- Performance tests
- WebGL-specific tests
- Visual regression tests

## Key Findings

1. Multiple Source Code Locations
   - Multiple `/src` directories exist at different levels
   - Market analysis code is spread across multiple locations
   - Possible code duplication or fragmentation

2. Configuration Management
   - Well-organized build and test configurations
   - Clear separation of TypeScript and JavaScript configs
   - Comprehensive testing setup across multiple types

3. Component Organization
   - Clear separation of concerns in components
   - Dedicated directories for specific features
   - Good isolation of WebGL and sacred geometry related code

4. Testing Coverage
   - Comprehensive test structure
   - Multiple testing approaches (unit, e2e, performance)
   - Dedicated test utilities and mocks

## Recommendations

1. Source Code Consolidation
   - Consolidate multiple `/src` directories into a single source tree
   - Merge duplicate market analysis code into a single location
   - Create clear boundaries between different feature domains

2. Directory Structure Improvements
   - Consider moving all configuration files into a `/config` directory
   - Standardize the location of test files (either co-located or in central test directory)
   - Create a clear separation between core and feature-specific code

3. Documentation Enhancements
   - Add README files in key directories to explain purpose and contents
   - Document the reasoning behind any necessary code duplication
   - Provide clear guidelines for where new code should be placed

## Directory Visualization

```
NeoSnipe/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── market_analysis/
│   ├── utils/
│   └── types/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
├── market_analysis/
│   └── core/
├── visual_design/
│   └── sacred_patterns/
├── config files
└── documentation
```

## Next Steps

1. Begin consolidation of duplicate directories
2. Implement standardized directory structure
3. Add documentation to clarify code organization
4. Review and clean up any unused code paths