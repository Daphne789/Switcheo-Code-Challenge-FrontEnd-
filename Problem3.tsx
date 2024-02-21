/* 
Q1:
- Inefficient fetching of prices: the prices are fetched in every render even though they are no changes
- Inefficient sorting: Since it is computationally expensive operation so want to minimize the unnecessary computation
- Inefficient getting the priority: unnecessary recalculations for every render even though there is not any changes
- Unnecessary mapping for `formattedBalances`: it is just increasing the overhead without any use in anywhere

Q3:
- Inefficient fetching of prices: I improve it by fetching prices only once when the component mounts 
  and also add proper error handling and loading state
- Inefficient sorting: I improve it by removing the if-else statements
- Inefficient getting the priority:  I improve it with memoization by using useMemo
- Unnecessary mapping for formattedBalances:  I removed the `FormattedWalletBalance` and `formattedBalances`. Then just directly
  formatted the amount in the `rows`
- To prevent any possible error better do not use 'any' as a type therefore I changed the blockchain type into 'string'
- Since there are missing properties for 'blockchain' and 'children', I added those properties in `WalletBalance` and `Props` respectively
- Adding `getPriority` in the `sortedBalances` dependency array since it is used within the useMemo hook
*/

import React, { useEffect, useMemo, useState } from 'react';
import { BoxProps } from 'box-library'; // Assuming the component has been created or imported from an existing UI library
import { useWalletBalances } from 'wallet-hook'; // Assuming the hook has been created in another file
import WalletRow from 'wallet-row'; // Assuming the component has been created in another file
import styles from 'css-file'; // Assuming the CSS file for the styling has been created 

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}
  
class Datasource {
  url: string;

  constructor(url: string) {
    this.url = url
  }

  async getPrices() {
    try {
      const response = await fetch(this.url);
      const data = await response.json();
      return data
    } catch (error) {
      throw new Error ('Failed to fetch prices: ' + error.message);
    }
  }
}
  
interface Props extends BoxProps {
  children?: React.ReactNode;
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const datasource = new Datasource("https://interview.switcheo.com/prices.json");
        const prices = await datasource.getPrices();
        setPrices(prices);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
  
    fetchData();
  
  }, []);
  
  const getPriority = useMemo(() => {
    return (blockchain: string): number => {
      switch (blockchain) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
      case 'Neo': 
        return 20;
      default:
        return -99
      }
    };
  }, []);
  
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0;
      }) 
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority;
      })
  }, [balances, prices, getPriority]);
  

  const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={styles.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed()}
      />
    );
  });
  
  return (
    <div {...rest}>
      {rows}
    </div>
  )
};

export default WalletPage;
