import { h } from 'preact';
import Profile from '../src/routes/profile';
import { initModel, Premium, Premiums, cheapestOption, savings, averageCost, findAll } from '../src/routes/profile/index';
// See: https://github.com/preactjs/enzyme-adapter-preact-pure
import { shallow } from 'enzyme';

describe('Initial Test of the Profile', () => {
    test('Header renders 3 nav items', () => {
        const context = shallow(<Profile user='Finn' model={initModel} />);
        expect(context.find('div').length).toBe(1);
    });
});

function numberArr(max: number): number[] {
  let newArr: number[] = new Array(max);
  for (let i = 0; i < max; i++) {
    newArr[i] = i + 1;
  }
  return newArr;
}

describe('Test helper function that creats an array of succesive numbers.', () => {
  test('an array of 5 numbers', () => {
    const exptectedArr = [1, 2, 3, 4, 5];
    const calculatedArr = numberArr(5);
    expect(calculatedArr).toStrictEqual(exptectedArr);
  });
});


describe('Calculate cheapest option', () => {
  test('1 accident every year should return option option 3', () => {
    const myPremiums = findAll("test");
    const calculatedOption = cheapestOption(myPremiums, 1);
    expect(calculatedOption).toBe(3);
  });

  test('1 accident every 2 years should return option option 3', () => {
    const myPremiums = findAll("test");
    const calculatedOption = cheapestOption(myPremiums, 2);
    expect(calculatedOption).toBe(3);
  });

  test('1 accident every 3 years should return option option 6', () => {
    const myPremiums = findAll("test");
    const calculatedOption = cheapestOption(myPremiums, 3);
    expect(calculatedOption).toBe(6);
  });

  test('1 accident every 4 years should return option option 6', () => {
    const myPremiums = findAll("test");
    const calculatedOption = cheapestOption(myPremiums, 4);
    expect(calculatedOption).toBe(8);
  });

  test('1 accident every 5 years should return option option 6', () => {
    const myPremiums = findAll("test");
    const calculatedOption = cheapestOption(myPremiums, 5);
    expect(calculatedOption).toBe(8);
  });
});

describe('Calculate savings per option', () => {
  test('The savings for option 1 is always zero for any number of years.', () => {
    const myPremiums = findAll("test");
    const myOption = 1;
    let yearsArr: number[] = numberArr(5);
    yearsArr.forEach((year) => {
      const calculatedSavings = savings(myPremiums, year, myOption);
      expect(calculatedSavings).toBe(0);
    });
  });

  test('The savings for option 3 over the years.', () => {
    const myPremiums = findAll("test");
    const myOption = 3;
    const yearsArr: number[] = numberArr(5);
    const expectedSavingArr: number[] = [1875, 5912, 9949, 13986, 18023];
    yearsArr.forEach((year) => {
      const calculatedSavings = savings(myPremiums, year, myOption);
      const expectedSaving = expectedSavingArr[year - 1];
      expect(calculatedSavings).toBe(expectedSaving);
    });
  });

  test('The savings for each option when one acident every 3 years.', () => {
    const myPremiums = findAll("test");
    const year = 3;
    const optionsArr: number[] = numberArr(11);
    const expectedSavingArr: number[] = [0, 5849, 9949, 10389, 10563, 11543, 9960, 9837, 7616, 6578, 754];
    optionsArr.forEach((myOption) => {
    const calculatedSavings = savings(myPremiums, year, myOption);
      const expectedSaving = expectedSavingArr[myOption - 1];
      expect(calculatedSavings).toBe(expectedSaving);
    });
  });

});

describe('Calculate average cost per month', () => {
  test('The average cost option 6 over 3 years.', () => {
    const myPremiums = findAll("test");
    const myOption = 6;
    const years = 3;
    const calculatedCost = averageCost(myPremiums, years, myOption);
    expect(calculatedCost).toBe(854);
  });

  test('The average costs for option 3 over the years.', () => {
    const myPremiums = findAll("test");
    const myOption = 3;
    const yearsArr: number[] = numberArr(5);
    const expectedAverageArr: number[] = [1019, 929, 898, 883, 874];
    yearsArr.forEach((year) => {
      const calculatedAverage = averageCost(myPremiums, year, myOption);
      const expectedAverage = expectedAverageArr[year - 1];
      expect(calculatedAverage).toBe(expectedAverage);
    });
  });

  test('The average for each option when one acident every 3 years.', () => {
    const myPremiums = findAll("test");
    const year = 3;
    const optionsArr: number[] = numberArr(11);
    const expectedAverageArr: number[] = [1175, 1012, 898, 886, 881, 854, 898, 902, 963, 992, 1154];
    optionsArr.forEach((myOption) => {
    const calculatedAverage = averageCost(myPremiums, year, myOption);
      const expectedAverage = expectedAverageArr[myOption - 1];
      expect(calculatedAverage).toBe(expectedAverage);
    });
  });
});





