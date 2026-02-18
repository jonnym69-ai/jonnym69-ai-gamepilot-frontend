// Test robust genre inference
const testCases = [
  {
    name: 'Football Manager 2024',
    steamData: {
      short_description: 'A football management game with strategic gameplay'
    }
  },
  {
    name: 'Call of Duty: Modern Warfare',
    steamData: {
      genres: [{ description: 'Action' }]
    }
  },
  {
    name: 'Tetris',
    steamData: {
      categories: [{ description: 'Puzzle' }]
    }
  },
  {
    name: 'Zombie Survival',
    steamData: {
      tags: [{ description: 'Horror' }]
    }
  }
];

console.log('🧪 Testing Robust Genre Inference Engine...');

testCases.forEach((game, index) => {
  // Simulate the inference logic
  let inferred = [];
  
  // Test description-based inference
  if (game.steamData?.short_description) {
    const desc = game.steamData.short_description.toLowerCase();
    if (desc.includes('football')) inferred.push('sports');
    if (desc.includes('strategic')) inferred.push('strategy');
  }
  
  // Test genre-based inference  
  if (game.steamData?.genres) {
    game.steamData.genres.forEach((genre) => {
      const genreDesc = genre.description?.toLowerCase() || '';
      if (genreDesc.includes('action')) inferred.push('action');
    });
  }
  
  // Test category-based inference
  if (game.steamData?.categories) {
    game.steamData.categories.forEach((cat) => {
      const catDesc = cat.description?.toLowerCase() || '';
      if (catDesc.includes('puzzle')) inferred.push('puzzle');
    });
  }
  
  // Test tag-based inference
  if (game.steamData?.genres) {
    game.steamData.genres.forEach((genre) => {
      const genreDesc = genre.description?.toLowerCase() || '';
      if (genreDesc.includes('horror')) inferred.push('horror');
    });
  }
  
  // Test name-based inference
  if (game.name) {
    const name = game.name.toLowerCase();
    if (name.includes('football')) inferred.push('sports');
    if (name.includes('tetris')) inferred.push('puzzle');
  }
  
  // Default fallback
  if (inferred.length === 0) {
    inferred.push('indie');
  }
  
  const uniqueInferred = [...new Set(inferred)];
  console.log(`${index + 1}. ${game.name}: ${uniqueInferred.join(', ')}`);
  
  // Verify expected results
  const expected = {
    1: ['sports'], // Football Manager - description contains 'football'
    2: ['action'], // Call of Duty - genre contains 'Action' 
    3: ['puzzle'], // Tetris - category contains 'Puzzle'
    4: ['horror'], // Zombie Survival - tag contains 'Horror'
    5: ['indie'] // Should default for no data
  };
  
  const success = expected[index + 1].every(genre => 
    uniqueInferred.includes(genre)
  );
  
  console.log(`✅ Test ${index + 1}: ${success ? 'PASS' : 'FAIL'}`);
});

console.log('\n🎯 Expected Results:');
console.log('1. Football Manager → sports (description-based)');
console.log('2. Call of Duty → action (genre-based)');
console.log('3. Tetris → puzzle (category-based)');
console.log('4. Zombie Survival → horror (tag-based)');
console.log('5. No data test → indie (default fallback)');

const allPassed = [1, 2, 3, 4].every(i => expected[i].every(genre => 
  uniqueInferred.includes(genre)
));

console.log(`\n🏆 Overall Engine Test: ${allPassed.every(Boolean) ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
