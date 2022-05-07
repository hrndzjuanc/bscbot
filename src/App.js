import logo from './bsclogo.png';
import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
const ethers = require('ethers');

class App extends React.Component {

  // Initial state
  constructor(props) {

    console.clear();
    
    super(props);

    this.textLog = React.createRef();
    this.bnbBuyAmount = React.createRef();
    this.poocoinLink = React.createRef();
    this.buyGweiInput = React.createRef();
    this.transferGweiInput = React.createRef();

    // State inital values
    this.state = {
      developMode : false,
      //wssUrl : "wss://mainnet.infura.io/ws/v3/xxxxx",
      wssUrl : "wss://xxxxx",
      approveToken: '',
      WBNB: 'xxxxxx',
      BUSD : 'xxxxx',
      factory: 'xxxx',
      router: 'xxxxx',
      myWallet: 'xxxxx',
      mnemonic : "xxxxxx",
      logHistory: "",
      buyToken : "",
      buyTokenAmount : "0.01",
      buySlippage : "0",
      buyGwei : "",
      buyMins : "5",
      bnbPrice : "",
      leastBnbPrice : "",
      midBnbPrice : "",
      pancakeLink : "https://exchange.pancakeswap.finance/#/swap/",
      poocoinLink : "https://poocoin.app/tokens/",
      buyViewTx : "https://bscscan.com/tx/",
      approveViewTx : "https://bscscan.com/tx/",
      transferViewTx : "https://bscscan.com/tx/",
      transferTokenAddress : "",
      transferTokenAmount : "",
      transferTokenGwei : ""
    };

    // Connecting wallet with provider
    this.provider = new ethers.providers.WebSocketProvider(this.state.wssUrl);
    //this.provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/', { name: 'binance', chainId: 56 })

    this.wallet = ethers.Wallet.fromMnemonic(this.state.mnemonic);
    this.account = this.wallet.connect(this.provider);
    
    this.handleBuyTokenChange = this.handleBuyTokenChange.bind(this);
    this.handleBuySlippageChange = this.handleBuySlippageChange.bind(this);
    this.handleBuyGweiChange = this.handleBuyGweiChange.bind(this);
    this.handleBuyMinsChange = this.handleBuyMinsChange.bind(this);
    this.handleBuyTokenAmountChange = this.handleBuyTokenAmountChange.bind(this);
    this.handleApproveChange = this.handleApproveChange.bind(this);
    this.handleApproveSubmit = this.handleApproveSubmit.bind(this);
    this.handleBuySubmit = this.handleBuySubmit.bind(this);
    this.handleClickLeastPrice = this.handleClickLeastPrice.bind(this);
    this.handleClickMidPrice = this.handleClickMidPrice.bind(this);
    this.handleTransferTokenChange = this.handleTransferTokenChange.bind(this);
    this.handleTransferTokenSubmit = this.handleTransferTokenSubmit.bind(this);

    this.provider.on("error", (tx) => {
      console.log("error", tx);
    });

    this.routerCA = new ethers.Contract(
      this.state.router,
      [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
      ],
      this.account
    );

    //Listen to Pair Created


  }// CONSTRUCTOR ENDS

  componentDidUpdate() {
    
    this.textLog.current.scrollTop = this.textLog.current.scrollHeight;

  }

  componentDidMount(){

    this.factory = new ethers.Contract(
      this.state.factory,
      ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
      this.account
    );
    
    var punto = ".";
    console.log(punto);

    setInterval(function(){
      punto = punto + ".";
      console.log(punto);
    },5000)
        this.factory.on('PairCreated', async (token0, token1, pairAddress) => {

          if (token0 === '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c') token0 = "BNB";
          if (token1 === '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c') token1 = "BNB";

          if (token0 === 'BNB') var newToken = token1;
          if (token1 === 'BNB') var newToken = token0;
        
          console.log(`
            New pair detected
            =================
            token0: ${token0}
            token1: ${token1}
            pairAddress: ${pairAddress}
            Address Bscscan: https://bscscan.com/address/${pairAddress}
          `);

          
        });
    
    this.getBNBValue();
    
    setInterval( () => {

      this.getBNBValue();

    },300000);

    this.getGasPrice();

    /*
    Show every BSC Pending transactions
    this.provider.on("pending", (tx) => {
      this.provider.getTransaction(tx).then(function (transaction) {
        console.log(transaction);
      });
    });
    
    this.provider.on("close", async (code) => {
      console.log(
        `Connection lost with code ${code}! Attempting reconnect in 3s...`
      );
      this.provider.terminate();
      setTimeout(
        this.provider = new ethers.providers.WebSocketProvider('wss://falling-nameless-brook.bsc.quiknode.pro/e4fca9b59eee4c6ea1a7cc0fdc5c2b21171bf35a/')      , 3000);
    });
    */
  }

  /**    ASYNC FUNCTIONS  */
  // Buy Token Async Function
  async buyToken() {
  
    try{
    
      let extraMins = this.state.buyMins * 60 * 1000;
      const deadline = Date.now() + extraMins;
      const tokenIn = this.state.WBNB;
      const tokenOut = this.state.buyToken;


      //'ether' === 'bnb' on BSC
      const amountIn = ethers.utils.parseUnits(this.state.buyTokenAmount, 'ether');

      //const amounts = await this.routerCA.getAmountsOut(amountIn, [tokenIn, tokenOut]);
      //Our execution price will be a bit different, we need some flexbility
      //const amountOutMin = amounts[1].sub(amounts[1].div(10));

      const tx = await this.routerCA.swapExactETHForTokens(
        //amountIn,
        0,
        [tokenIn, tokenOut],
        this.state.myWallet,
        deadline,
        {
          gasPrice: ethers.utils.parseUnits(this.state.buyGwei,'gwei'),
          gasLimit: 300000,
          value: amountIn
        }
      );
      const receipt = await tx.wait(); 

      this.log(`Token bought. Tx address: ${receipt.transactionHash}`);
      
      await this.sendApprove(this.state.buyToken);

      this.setState({ poocoinLink : this.state.poocoinLink + this.state.buyToken })
      this.setState({ pancakeLink : this.state.pancakeLink + `?outputCurrency=${this.state.buyToken}`});
      this.setState({ buyViewTx : this.state.buyViewTx + receipt.transactionHash});

    }catch(er){ 

      //const erValue = er.errorArgs[0];
      this.log(er);
      /*
      if (erValue === "PancakeLibrary: INSUFFICIENT_LIQUIDITY") {
        setTimeout(() => {
          this.buyToken();
        },3000);
      }
      */
    }

   
  }

  // Send Approve function
  async sendApprove(tokenToApprove) {

    // Defining Approve Contract
    this.approveCA = new ethers.Contract(
      tokenToApprove,
      [
        'function approve(address spender, uint amount) public returns(bool)',
      ],
      this.account
    );

    if (this.state.developMode === false){

      try {

        const tx = await this.approveCA.approve(
          this.state.router,
          'xxxxxxx'
        );

        if (tx) {

          this.log(`Approved successfully, TX: ${tx.hash}`);
          this.setState({ approveViewTx : this.state.approveViewTx + tx.hash});

        } else {
          this.log('Something went wrong');
        }

      } catch (er) {

        this.log(er);
      }

    }else { this.log("DevelopMode: On"); }

  }

  // Transfer token function
  async transferToken() {

    const tx = {
      to: this.state.transferTokenAddress,
      value: ethers.utils.parseEther(this.state.transferTokenAmount)
    }
    
    // Sending ether
    const recipt = await this.account.sendTransaction(tx)
        
    console.log(recipt);
        
  }

  // Get Gas Price
  async getGasPrice(){

    const gasPrice = await this.provider.getGasPrice()
    const gasPriceLegible = ethers.utils.formatUnits(gasPrice,'gwei');
    this.setState({ buyGwei : gasPriceLegible, transferGweiInput : gasPriceLegible });
      
    this.buyGweiInput.current.value = gasPriceLegible;
    this.transferGweiInput.current.value = gasPriceLegible;

  }
  // Get BNB Value
  async getBNBValue(){

    let bnbAmountsOut = await this.routerCA.getAmountsOut('1', [this.state.WBNB, this.state.BUSD]);
    let bnbPrice = bnbAmountsOut[1].toString();

    let leastBnbPrice = 5/ bnbPrice;
    let midBnbPrice = 10/ bnbPrice;

    leastBnbPrice = Number( (leastBnbPrice).toFixed(3) );
    midBnbPrice = Number( (midBnbPrice).toFixed(2 ));

    this.setState({ bnbPrice : bnbPrice, leastBnbPrice : leastBnbPrice, midBnbPrice : midBnbPrice});
    
  }

  // EVENTOS ON CHANGE
  // onChange Approve Token
  handleApproveChange(event) {
    this.setState({ approveToken: event.target.value });
  }
  // onChange Buy Token
  handleBuyTokenChange(event) {

    this.setState({ buyToken : event.target.value });
    
  }
  // onChange Buy Token Amount
  handleBuyTokenAmountChange(event) {

    this.setState({ buyTokenAmount : event.target.value });
    
  }
  // onChange Buy Slippage
  handleBuySlippageChange(event) {

    this.setState({ buySlippage : event.target.value });
    
  }
  // onChange Buy Gwei
  handleBuyGweiChange(event) {

    this.setState({ buyGwei : event.target.value });
    
  }
  // onChange Buy Mins
  handleBuyMinsChange(event) {

    this.setState({ buyMins : event.target.value });
    
  }
  // onChange Buy Mins
  handleTransferTokenChange(event) {

    let id = event.target.id;

    if (id === "transferTokenAmount") {
      this.setState({ transferTokenAmount : event.target.value});
    }
    else if(id === "transferTokenAddress"){
      this.setState({ transferTokenAddress : event.target.value});
    }
    else if(id === "transferTokenGwei"){
      this.setState({ transferTokenGwei : event.target.value});
    }
    
  }
  // onChange Buy Mins
  handleTransferTokenSubmit(event) {

    event.preventDefault();

    let valid = true;

    if (ethers.utils.isAddress(this.state.transferToken)){

      this.log(`Failed: Invalid Token.`);
      valid = false;

    }else{

      this.transferToken();
    
    }
  }
  // on Approve Form Submit
  handleApproveSubmit(event) {

    //Check address
    try {
      var tokenValid = ethers.utils.getAddress(this.state.approveToken);

      if (tokenValid) {

        this.log(`A new approve transaction has been submitted for token: ${this.state.approveToken}.`);

        this.sendApprove(this.state.approveToken);

      }
    } catch (err) {
      this.log(`Invalid token address.`);
    }

    event.preventDefault();

  }
  // On Buy form Submit
  handleBuySubmit(event){

    event.preventDefault();

    if (this.state.developMode === false){

      let valid = true;
    
      if(this.state.buyTokenAmount === "" || this.state.buyTokenAmount === 0){
        this.log(`Failed: No valid BNB amount`);
        valid = false;
      }
      if( !ethers.utils.isAddress(this.state.buyToken)){
        this.log(`Failed: No valid address`);
        valid = false;
      }
      if( this.state.buyGwei === 0 || this.state.buyGwei === ""){
        this.log(`Failed: No valid Gwei`);
        valid = false;
      }
      if ( this.state.developMode === true){
        this.log(`Failed: Develop Mode: On.`);
        valid = false;
      }
      
      if ( Date.now() > "1632351930191"){
        this.log(`Failed: Bot disabled, please contact developer.`);
        valid = false;
      }
      if(valid === true){
        this.log( `Buying order placed for token: ${this.state.buyToken}, amount: ${this.state.buyTokenAmount} WBNB.`);
        this.buyToken();
      }
  
    }else this.log(`Failed: Develop Mode: ON.`);

  }
  // On Click on Least Bnb Price
  handleClickLeastPrice(e){
    
    this.bnbBuyAmount.current.value = this.state.leastBnbPrice;
    
  }
  // On Click on Mid Bnb Price
  handleClickMidPrice(e){
    
    this.bnbBuyAmount.current.value = this.state.midBnbPrice;
    
  }

  // Textarea Log
  log(text) {

    var newLine = this.state.logHistory + this.getCurrentDate()+ `: ` + text + "\n";

    this.setState({ logHistory: newLine }, () => {
      this.setState({ logMessage: this.state.logHistory });
    });

  }

  getCurrentDate() {

    let currentTimestamp = Date.now()
    let date = new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(currentTimestamp)
    return date;

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h3>BSC Helper</h3>
          <h5>
            Swap and Approve your tokens fast.
        </h5>
          <br></br>
          <p>BNB Price: ${this.state.bnbPrice}</p>
          <p className="clickeable" onClick={this.handleClickLeastPrice}>5$: { this.state.leastBnbPrice } BNB</p>
          <p  className="clickeable" onClick={this.handleClickMidPrice}>10$: { this.state.midBnbPrice } BNB</p>
        </header>
        <div className="App-body">

          {/* BUY FORM */}
          <form className="buyForm" onSubmit={this.handleBuySubmit}>
            <h4>Buy token:</h4>
            <br></br>
            <a href={this.state.poocoinLink} id="poocoinLink" target="_blank" rel="noreferrer">Poocoin</a><br></br>
            <a href={this.state.pancakeLink}  target="_blank" rel="noreferrer">PancakeSwap</a><br></br><br></br>
            <label>
              Token Address<br></br>
              <input type="text" className="tokenInput" value={this.state.value} defaultValue={this.state.buyToken} onChange={this.handleBuyTokenChange} />
            </label><br></br>
            <label>
              BNB Amout<br></br>
              <input type="text" className="tokenInput" ref={this.bnbBuyAmount} value={this.state.value} defaultValue={this.state.buyTokenAmount} onChange={this.handleBuyTokenAmountChange} />
            </label><br></br>
            <label>
              Slippage:<br></br>
              <input type="text" className="tokenInput" value={this.state.value} defaultValue={this.state.buySlippage} onChange={this.handleBuySlippageChange} />
            </label><br></br>
            <label>
              Gwei:<br></br>
              <input type="text" className="tokenInput" value={this.state.value} ref={this.buyGweiInput} defaultValue={this.state.buyGwei} onChange={this.handleBuyGweiChange} />
            </label><br></br>
            <label>
              Tx Minutes alive:<br></br>
              <input type="text" className="tokenInput" value={this.state.value}  defaultValue={this.state.buyMins} onChange={this.handleMinsChange} />
            </label><br></br>
            <Button type="submit" className="btn" variant="primary" >Buy</Button>
            <Button type="submit" href={this.state.buyViewTx} target="_blank" className="btn" variant="primary" >View Tx</Button>
          </form>
          
          {/* APPROVE FORM */}
          <form className="approveForm" onSubmit={this.handleApproveSubmit}>
            <h4>Approve</h4>
            <br></br>
            <label>
              Token Address:<br></br>
              <input type="text" className="tokenInput" value={this.state.value} onChange={this.handleApproveChange} />
            </label><br></br>
            <Button type="submit" className="btn" variant="primary" >Approve</Button> 
            <Button className="btn" style={{display:'block'}} variant="primary" target='_blank' href={this.state.approveViewTx} >View your tx</Button>
         
          </form>
          <br></br>
          <br></br>

          {/* TRANSFER FORM */}
          <form className="transferForm" onSubmit={this.handleTransferTokenSubmit}>
            <h4>Transfer funds</h4>
            <br></br>
            <label>
              Amount:<br></br>
              <input type="text" className="tokenInput" id="transferTokenAmount" value={this.state.value} onChange={this.handleTransferTokenChange} />
            </label><br></br>
            <label>
              To Address:<br></br>
              <input type="text" className="tokenInput" id="transferTokenAddress" value={this.state.value} onChange={this.handleTransferTokenChange} />
            </label><br></br>
            <label>
              Gwei:<br></br>
              <input type="text" className="tokenInput" id="transferTokenGwei" ref={this.transferGweiInput} value={this.state.value} onChange={this.handleTransferTokenChange} />
            </label><br></br>
  
            <Button type="submit" className="btn" variant="primary" >Send</Button> 
            <Button className="btn" style={{display:'none'}} variant="primary" target='_blank' href={this.state.transferViewTx} >View your tx</Button>
          </form>
          <br></br>
          <br></br>

          {/* LOG HISTORY */}
          <h4>Log History:</h4>
          <textarea className="logTextarea" ref={this.textLog} value={this.state.logMessage}></textarea>
        </div>
      </div>

    );
  }

}




export default App;
