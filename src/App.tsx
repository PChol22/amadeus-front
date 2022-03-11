import React from 'react';
import './App.css';
import Plot from 'react-plotly.js';
import { Slider, Checkbox, TextField, Button  } from '@mui/material';
import UnstyledSelectRichOptions from './countries';

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
  formData: {
    departure: string,
    destination: string,
    nbConnections: number[]
    searchCountry?: string,
    searchId?: string,
    stayDuration: number[],
    searchDate: number[],
    isTripRound: boolean,
  },
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
    const today = new Date();
    const beforeDate = new Date();
    beforeDate.setDate(today.getDate() - 720);
    this.state = {
      isLoading: false,
      formData: {
        departure: '',
        destination: '',
        nbConnections: [1,6],
        stayDuration: [0, 720],
        isTripRound: false,
        searchDate: [-720, 0],
      },
      data: undefined,
    };
    this.callApi = this.callApi.bind(this);
    this.handleChangeDep = this.handleChangeDep.bind(this);
    this.handleChangeDest = this.handleChangeDest.bind(this);
    this.handleChangeCountry = this.handleChangeCountry.bind(this);
    this.handleChangeNbConnections = this.handleChangeNbConnections.bind(this);
    this.handleChangeStayDuration = this.handleChangeStayDuration.bind(this);
    this.handleChangeIsTripRound = this.handleChangeIsTripRound.bind(this);
    this.handleChangeSearchDate = this.handleChangeSearchDate.bind(this);
    this.handleKey = this.handleKey.bind(this);
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
      body: JSON.stringify({
        ond: `${this.state.formData.departure}${this.state.formData.destination}`,
        search_country: this.state.formData.searchCountry || null,
        nb_connections: this.state.formData.nbConnections,
        stay_duration: this.state.formData.isTripRound ? this.state.formData.stayDuration : null,
        search_date: this.state.formData.searchDate.map(d => this.intToDate(d)),
        trip_type: this.state.formData.isTripRound ? 'RT' : 'ST',
      })
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
      formData: {
        ...this.state.formData,
        departure: event.target.value,
      }
    })
  }

  public handleChangeDest(event: { target: { value: string }}) {
    this.setState({
      ...this.state,
      formData: {
        ...this.state.formData,
        destination: event.target.value,
      }
    })
  }

  public handleChangeNbConnections(_: any, data: any) {
    this.setState({
      ...this.state,
      formData: {
        ...this.state.formData,
        nbConnections: [data[0], data[1]],
      }
    });
  }

  public handleChangeIsTripRound(event: { target: { checked: boolean }}) {
    this.setState({
      ...this.state,
      formData: {
        ...this.state.formData,
        isTripRound: event.target.checked,
      }
    });
  }

  public handleChangeStayDuration(_: any, data: any) {
    this.setState({
      ...this.state,
      formData: {
        ...this.state.formData,
        stayDuration: [data[0], data[1]],
      }
    });
  }

  public handleChangeSearchDate(_: any, data: any) {
    this.setState({
      ...this.state,
      formData: {
        ...this.state.formData,
        searchDate: [data[0], data[1]],
      }
    });
  }

  public handleChangeCountry(e: any) {
    this.setState({
      ...this.state,
      formData: {
        ...this.state.formData,
        searchCountry: e,
      }
    });
  }

  public handleKey(e: any) {
    if (e.code === 'Enter' && this.state.formData.departure && this.state.formData.destination) {
      this.callApi(); 
    } 
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

  public intToDate(i: number) {
    const last = new Date();
    const current = new Date();
    current.setDate(last.getDate() + i);
    return current.toISOString().slice(0,10);
  }

  public render(): JSX.Element {

    const data = this.computeGraphData();

    const layout = {
      title: 'Price history of OND : ' + this.state.data?.ond,
    };
    
    return (
      <div className="container">
        <div className="form" onKeyPress={this.handleKey} >
          <div className='form-field'>
            <label>DEPARTURE (*): </label><br/>
            <TextField variant="outlined" onChange={this.handleChangeDep} className="text"/>
          </div>
          <div className='form-field'>
            <label>DESTINATION (*): </label><br/>
            <TextField variant="outlined" onChange={this.handleChangeDest} className="text"/>
          </div>
          <div className="layout">
            <div className='form-field'>
              <label>IS TRIP ROUND ? </label>
              <Checkbox onChange={this.handleChangeIsTripRound}/>
            </div>
            <div className='form-field'>
              <label>STAY DURATION : </label>
              <Slider
                getAriaLabel={() => 'Stay Duration'}
                onChange={this.handleChangeStayDuration}
                value={[this.state.formData.stayDuration[0], this.state.formData.stayDuration[1]]}
                valueLabelDisplay="auto"
                step={1}
                min={0}
                max={31}
                disabled={!this.state.formData.isTripRound}
                marks={[{value: 0, label: '0'}, {value: 31, label: '31'}]}
              />
            </div>
          </div>
          <div className='form-field'>
            <label>SEARCH COUNTRY : </label><br/>
            { UnstyledSelectRichOptions(this) }
          </div>
          <div className='form-field'>
            <label>NB CONNECTIONS : </label>
            <Slider
              getAriaLabel={() => 'Nb Connections'}
              onChange={this.handleChangeNbConnections}
              value={[this.state.formData.nbConnections[0], this.state.formData.nbConnections[1]]}
              valueLabelDisplay="auto"
              step={1}
              min={1}
              max={6}
              marks={[{value: 1, label: '1'}, {value: 6, label: '6'}]}
            />
          </div>
          <div className='form-field'>
            <label>SEARCH DATE : </label>
            <Slider
              getAriaLabel={() => 'Search date'}
              onChange={this.handleChangeSearchDate}
              value={[this.state.formData.searchDate[0], this.state.formData.searchDate[1]]}
              valueLabelDisplay="auto"
              step={1}
              min={-720}
              max={0}
              valueLabelFormat={this.intToDate}
              marks={[{value: -720, label: this.intToDate(-720)}, {value: 0, label: this.intToDate(0)}]}
            />
          </div>
          <div className='form-field'>
            <Button variant="outlined" onClick={this.callApi} disabled={!this.state.formData.departure || !this.state.formData.destination}>FETCH DATA</Button>
            <Button variant="outlined" onClick={() => console.log(this.state.formData)}>STATE</Button>
          </div>
        </div>
        { (this.state.isLoading || this.state.data) && <div className="dataContainer">
          { this.state.isLoading && <img className="loading" alt="loading" src={require("./spinner.gif")}/> }
          { this.state.data && !this.state.isLoading && <Plot data={ data } layout={ layout } className="data"/>}
        </div> }
        { !(this.state.isLoading || this.state.data) && <div className="titleContainer">
          <img className="plane" alt="loading" src={require("./title.png")}/>
        </div> }
      </div>
    );
  }
}

export default ExampleComponent;
