import { useEffect } from 'react';
import portfolioMarkup from '../portfolio.html?raw';

export default function App() {
  useEffect(() => {
    import('../script.js');
  }, []);

  return <div className="portfolio-root" dangerouslySetInnerHTML={{ __html: portfolioMarkup }} />;
}
