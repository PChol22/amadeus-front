import React from 'react';
import './App.css';
import Plot from 'react-plotly.js';

interface ApiResponse {
  ond: string,
  companies: {
    [key: string]: {
      x: number[],
      y: number[],
    },
  }
};

interface State {
  isLoading: boolean,
  departure: string,
  destination: string,
  data: ApiResponse | undefined,
};

interface GraphData {
  x: number[],
  y: number[],
  mode: string,
  name: string,
  line: {
    color: string,
    width: number,
    shape: string,
  },
};

const graphColors = [
  'rgb(255,100,0)',
  'rgb(255,0,100)',
  'rgb(0,100,255)',
  'rgb(100,0,255)',
  'rgb(0,255,100)',
  'rgb(100,255,0)',
];

class ExampleComponent extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      departure: '',
      destination: '',
      data: undefined,
    };
    this.callApi = this.callApi.bind(this);
    this.handleChangeDep = this.handleChangeDep.bind(this);
    this.handleChangeDest = this.handleChangeDest.bind(this);
  }

  public callApi(): void {
    this.setState({
      ...this.state,
      isLoading: true,
    });
    const queryString = 'https://europe-west1-asi-etude-de-cas-groupea.cloudfunctions.net/db-front';
    const init: RequestInit = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ond: `${this.state.departure}${this.state.destination}`})
    }
    fetch(queryString, init)
    .then(res => res.json())
    .then((res: ApiResponse) => {
      this.setState({
        ...this.state,
        isLoading: false,
        data: res,
      });
    });
  }

  public handleChangeDep(event: { target: { value: string }}) {
    this.setState({
      ...this.state,
      departure: event.target.value,
    })
  }

  public handleChangeDest(event: { target: { value: string }}) {
    this.setState({
      ...this.state,
      destination: event.target.value,
    })
  }

  public computeGraphData(): GraphData[] {
    if (!this.state.data) return [];
    const data: GraphData[] = Object.keys(this.state.data.companies).map((company, i) => ({
      name: company,
      x: this.state.data?.companies[company].x || [],
      y: this.state.data?.companies[company].y || [],
      mode: (this.state.data?.companies[company].x || []).length > 1 ? 'lines' : 'scatter',
      line: {
        color: graphColors[i],
        width: 2,
        shape: 'spline',
      }
    }));
    return data;
    
  }

  public render(): JSX.Element {

    const data = this.computeGraphData();

    const layout = {
      title: 'Price history of OND : ' + this.state.data?.ond,
    };
    
    return (
      <div>
        <h1>Amadeux x ASI - Flight prices tracker</h1>
        <div className='form-field'><label>DEPART : </label><br/><input type="text" onChange={this.handleChangeDep}></input></div>
        <div className='form-field'><label>DESTINATION : </label><br/><input type="text" onChange={this.handleChangeDest}></input></div>
        <div className='form-field'><button onClick={this.callApi} disabled={!this.state.departure || !this.state.destination}>GET DATA</button></div>
        { this.state.isLoading && <img className="loading" alt="loading" src={require("./spinner.gif")}/> }
        { this.state.data && <Plot data={ data } layout={ layout } />}
      </div>
    );
  }
}

export default ExampleComponent;
