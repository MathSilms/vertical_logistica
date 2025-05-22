import { isValidDate, toISODate } from '../../../src/utils/date';

describe("isValidDate", () => {
  it("should return true for a valid date", () => {
    expect(isValidDate("2024-12-31")).toBe(true);
  });

  it("should return false for an invalid date (wrong format)", () => {
    expect(isValidDate("31/12/2024")).toBe(false); 
    expect(isValidDate("2024/12/31")).toBe(false);
    expect(isValidDate("2024-13-01")).toBe(false);
    expect(isValidDate("2024-12-32")).toBe(false);
  });

  it("should return false for empty or undefined string", () => {
    expect(isValidDate("")).toBe(false);
    expect(isValidDate('3232/231321/312321')).toBe(false);
  });
});

describe("toISODate", () => {
  it("should correctly format a date in ISO format", () => {
    expect(toISODate("20240315")).toBe("2024-03-15");
    expect(toISODate("19991231")).toBe("1999-12-31");
    expect(toISODate("20210101")).toBe("2021-01-01");
  });

  it("should return unexpected format if the string is incomplete", () => {
    expect(toISODate("2024")).toBe("2024--");          
    expect(toISODate("202403")).toBe("2024-03-");     
    expect(toISODate("")).toBe("--");                 
  });

  it("should handle longer strings without incorrect trimming", () => {
    expect(toISODate("202403150000")).toBe("2024-03-15");
  });
});
