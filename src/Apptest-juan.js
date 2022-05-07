import React from 'react';
const ethers = require('ethers');

class App extends React.Component {


  componentDidMount(){

    // Connecting wallet with provider

    this.provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/', { name: 'binance', chainId: 97 })
    
    var filter = {
      address: "0xae636b778ea9bef82a4f5df55d520df4cf44e3b5",
      fromBlock: 0
    };

    // You can also pull in your JSON ABI; I'm not sure of the structure inside artifacts
    let abi = [ "event Transfer(address indexed from, address indexed to, uint value)" ];
    let iface = new ethers.utils.Interface(abi);

    var logPromise = this.provider.getLogs(filter);

    logPromise.then(function(logs) {
        let events = logs.map((log) => iface.parseLog(log))
        console.log(events);
    }).catch(function(err){
        console.log(err);
    });

  }
  render() {
    return (
      <div className="App">
    
      </div>

    );
  }

}




export default App;
