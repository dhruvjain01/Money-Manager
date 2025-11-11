import moment from "moment";

export const addThousandsSeparator = (num) => {
    console.log(num);
    if (num == null || isNaN(num)) return "";

    // Convert number to string to handle decimals
    const numStr = num.toString();
    const parts = numStr.split('.'); // Split into integer and fractional parts
    
    let integerPart = parts[0];
    let fractionalPart = parts[1];
    
    // Regex for Indian numbering system
    // It handles the first three digits, then every two digits
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    
    if (otherNumbers !== '') {
        // Apply comma after every two digits for the 'otherNumbers' part
        const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        integerPart = formattedOtherNumbers + ',' + lastThree;
    }
    else {
        integerPart = lastThree; // No change if less than 4 digits
    }

    // Combine integer and fractional parts
    return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
};

export function prepareIncomeLineChartData(transactions) {
  if (!Array.isArray(transactions)) return [];

  const currentMonth = moment().month(); // 0-indexed
  const grouped = {};

  transactions.forEach((tx) => {
    const txDate = moment(tx.date);
    if (txDate.month() !== currentMonth) return; // skip if not this month

    const dateKey = txDate.format("YYYY-MM-DD");
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        totalAmount: 0,
        items: [],
        month: txDate.format("MMMM"),
      };
    }
    grouped[dateKey].totalAmount += Number(tx.amount) || 0;
    grouped[dateKey].items.push(tx);
  });

  // Sort by date and return as array
  return Object.values(grouped).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}

export function prepareExpenseLineChartData(transactions) {
  if (!Array.isArray(transactions)) return [];

  const currentMonth = moment().month(); // 0-indexed
  const grouped = {};

  transactions.forEach((tx) => {
    const txDate = moment(tx.date);
    if (txDate.month() !== currentMonth) return; // skip if not this month

    const dateKey = txDate.format("YYYY-MM-DD");
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        totalAmount: 0,
        items: [],
        month: txDate.format("MMMM"),
      };
    }
    grouped[dateKey].totalAmount += Number(tx.amount) || 0;
    grouped[dateKey].items.push(tx);
  });

  // Sort by date and return as array
  return Object.values(grouped).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}
