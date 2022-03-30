import { mixedTypeAnnotation } from '@babel/types';
import { render } from 'enzyme';
import { Attributes, Component, ComponentChild, ComponentChildren, FunctionalComponent, h, Ref } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.css';

export interface Premium {
    id: number;
    deductible: number;
    premium: number;
    saved: number;
}

export type Premiums = Premium[];

interface Props {
    user: string;
    model: State;
}

export type AppStates = "start" | "fetchingPremiums" | "gotPremiums" | "gotChoice" | "gotAccept" | "error" ;

interface State {
    success: boolean;
    appState: AppStates,
    errorMessage?: string;
    userMessage?: string;
    choiceYears?: number;
    allPremiums?: Premiums;
    choiceMade: boolean;
    bestOption?: number;
    totalSavings?: number;
    costPerYear?: number;
    offerAccepted: boolean;
};

export const initModel: State = {
    success: true,
    appState: "start",
    errorMessage: undefined,
    userMessage: undefined,
    choiceYears: undefined,
    allPremiums: undefined,
    choiceMade: false,
    bestOption: undefined,
    totalSavings: undefined,
    costPerYear: undefined,
    offerAccepted: false
}

// Lifting state up
// https://reactjs.org/docs/lifting-state-up.html
// https://codepen.io/gaearon/pen/WZpxpz?editors=0010

// Select Input see https://preactjs.com/guide/v10/forms

class MySelect extends Component {
    constructor(props: Props) {
        super(props);
        // this.onSubmit = this.onSubmit.bind(this);
        this.state = { value: '' };
    }

    // onChange = e => {
    // onChange(e) {
    //     this.setState({ value: e.target.value });
    // }

    // onSubmit(e) {
    //     this.props.onOptionSubmit(e.target.value);
    // }

    onChange(){}
    onSubmit(){}

    render() {
        // const myChoice: number = this.props.choice;
        // const myPremiums: Premiums = this.props.premiums;

        const myChoice: number = 3;
        const myPremiums: Premiums = findAll("MySelect");


        if (myPremiums === []) {
            return (
                <div></div>
            );
        } else {
            return (
                <form onSubmit={this.onSubmit}>
                  <p>The cheapest solution for you dependes on ...</p>
                  <p>How often do you think an accident might happen?</p>
                  <select class={style.select} value={myChoice} onChange={this.onChange}>
                    <option value="1">One accident every year</option>
                    <option value="2">One accident every two years</option>
                    <option value="3">One accident every three years</option>
                    <option value="4">One accident every four years</option>
                    <option value="5">One accident every five years</option>
                  </select>
                  <button class={style.button} type="submit">Submit choice</button>
                </form>
            );
        };
    }
}

function reportPremiums(where: string, premiums: Premiums): void {
    console.log(where + " ----------------------------");
    console.log("     id, deductible, premium, saved");
    premiums.forEach((e) => {
        console.log("data: " + e.id + ",     " + e.deductible + ",   " + e.premium + ",   " + e.saved);
    });
}

export function cheapestOption(myPremiums: Premiums, years: number): number {
    let newArray: PremiumHelper[] = [];
    myPremiums.forEach((e) => {
        let ph: PremiumHelper = calcSavedOverYears(e, years);
        newArray.push(ph);
    });

    let id: number = 0;
    let maxSaving = 0;

    interface PremiumHelper {
        id: number;
        deductible: number;
        premium: number;
        saved: number;
        savedOverYears: number;
    }

    function calcSavedOverYears(p: Premium, years: number): PremiumHelper {
        let ph: PremiumHelper = {
            id: p.id,
            deductible: p.deductible,
            premium: p.premium,
            saved: p.saved,
            savedOverYears: (p.saved * years - p.deductible)
        };
        let singlePremiums: Premiums = [];
        singlePremiums.push(p);
        return ph;
    }

    function findMaxSavings(ph: PremiumHelper) {
        if (maxSaving < ph.savedOverYears) {
            id = ph.id;
            maxSaving = ph.savedOverYears;
        }
    }

    newArray.forEach(findMaxSavings);
    return id;
}

export function savings(myPremiums: Premiums, years: number, id: number): number {
    let savedOverTime: number = 0;
    myPremiums.forEach((e) => {
        if (e.id === id) {
            savedOverTime = e.saved * years - e.deductible;
        }
    });
    return savedOverTime;
}

export function averageCost(myPremiums: Premiums, years: number, id: number): number {
    let costPerMonth: number = 0;
    myPremiums.forEach((e) => {
        if (e.id === id) {
            costPerMonth = (e.premium * years + e.deductible) / years / 12;
        }
    });
    return Math.round(costPerMonth);
}


class MyChoice extends Component {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        // const myPremiums = this.state.premium;
        // const myMessage = this.state.message;
        // const years = this.state.choice + 1;

        const myPremiums: Premiums = findAll("MyChoice");
        const myMessage: string = "Good choice";
        const years: number = 3;

        const bestOption: number = cheapestOption(myPremiums, years);
        const totalSavings: number = savings(myPremiums, years, bestOption);
        const costPerYear: number = averageCost(myPremiums, years, bestOption);

        return (
            <div>
                <p>
                    Option {bestOption} is the best choice for you.
                </p>
                <p>
                    You will save {totalSavings.toLocaleString('da-DK')} kr. over {years} years compared to option 1.
                </p>
                <p>
                    Your cost will be {costPerYear.toLocaleString('da-DK')} kr. in average per month over the next three years.
                </p>
                <button class={style.button} type="submit">Sounds good to me</button>
                <button class={style.buttonCancle} type="submit">Let me think about it</button>
            </div>
        );
    }
}

function formatPremium(premiumIn: any): Premium {
    return {
        id: premiumIn.id,
        deductible: premiumIn.deductible,
        premium: premiumIn.premium,
        saved: premiumIn.saved
    };
}

function formatPremiums(premiumsIn: any): Premiums {
    let premiums: Premiums = [];
    premiumsIn.forEach((element: any) => {
        premiums.push(formatPremium(element));
    });
    return premiums;
}

class ViewPremiums extends Component {
    constructor(props: Props) {
        super(props);
        this.handlePremiumsChange = this.handlePremiumsChange.bind(this);
        this.handleChoiceChange = this.handleChoiceChange.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.model = {
            message: "waiting",
            choice: 0,
            premiums: []
        };
    }

    handlePremiumsChange(myPremiums: Premiums): void {
        this.setState({premiums: myPremiums});
    }

    handleChoiceChange(myChoice: number): void {
         this.setState({choice: myChoice});
    }

    handleMessageChange(myMessage: string): void {
         this.setState({message: myMessage});
    }

    loadPremiums(): void {
        let url: string = "http://localhost:3000/premiums";

        fetch(url, {
            method: 'GET', // default
        })
            .then(function(response: Response): Promise<object> {
                return response.json();
            })
            .then(function(data: any): void {
                let myPremiums: Premiums = formatPremiums(data);
                // this.handlePremiumsChange(myPremiums);
                // this.handleMessageChange("Got premiums");
            })
            .catch(function(error: string): void {
                // this.handleMessageChange("Ups. Check your internet and try again.");
            })
    }

    getInfo = (): void => {
        this.handleMessageChange("fetching premiums");
        this.loadPremiums();
    }

    render() {
        const myPremiums = props.model.premium;
        const myMessage = props.model.message;
        const myChoice = props.model.choice;

        // const myPremiums = findAll("MyPremiums");
        // const myMessage = "Waiting";
        // const myChoice = 2;


        return (
            <div class={style.profile}>
                <h1>Get your personalized offer now.</h1>
                <p>We will help you choose the right premium and deductibel for your car insurance.</p>

                <p>As you know the higher the deductibe, the lower is the premium, but ...</p>
                <p>which premium and deductible will be the cheapest for you in the long run?</p>

                <p>
                    <button class={style.button} onClick={this.getInfo}>Get an offer</button> {myMessage}.
                </p>

                <div>
                    <table class={style.table}>
                        <tr>
                            <th>#</th>
                            <th>Yearly Premium</th>
                            <th>Deductible in case of an accident</th>
                            {/* <th>Saved</th> */}
                        </tr>
                        {myPremiums.map((p: Premium, index: number) => (
                        <tr key={index}>
                            <td>{p.id}</td>
                            <td>{p.premium.toLocaleString('da-DK')} kr.</td>
                            <td>{p.deductible.toLocaleString('da-DK')} kr.</td>
                            {/* <td>{p.saved}</td> */}
                        </tr>
                        ))}
                    </table>
                </div>

                <p></p>
                <div></div>

                <MySelect
                    // premiums={myPremiums}
                    // onOptionSubmit={this.handleChoiceChange}
                />
                <MyChoice
                    // premiums={myPremiums}
                    // choice={myChoice}
                />
            </div>
        );

    }

}

export function findAll(caller: string): Premiums {
    let premiumJson: string = `
    [
      {
        "id": 1,
        "deductible": 0,
        "premium": 14098,
        "saved": 0
      },
      {
        "id": 2,
        "deductible": 1126,
        "premium": 11773,
        "saved": 2325
      },
      {
        "id": 3,
        "deductible": 2162,
        "premium": 10061,
        "saved": 4037
      },
      {
        "id": 4,
        "deductible": 3603,
        "premium": 9434,
        "saved": 4664
      },
      {
        "id": 5,
        "deductible": 6081,
        "premium": 8550,
        "saved": 5548
      },
      {
        "id": 6,
        "deductible": 7207,
        "premium": 7848,
        "saved": 6250
      },
      {
        "id": 7,
        "deductible": 11487,
        "premium": 6949,
        "saved": 7149
      },
      {
        "id": 8,
        "deductible": 14415,
        "premium": 6014,
        "saved": 8084
      },
      {
        "id": 9,
        "deductible": 18919,
        "premium": 5253,
        "saved": 8845
      },
      {
        "id": 10,
        "deductible": 21622,
        "premium": 4698,
        "saved": 9400
      },
      {
        "id": 11,
        "deductible": 28154,
        "premium": 4462,
        "saved": 9636
      }
    ]`;

    let premiums: Premiums = formatPremiums(JSON.parse(premiumJson));
    return premiums;
}


const Profile: FunctionalComponent<Props> = (props: Props) => {
    const { user, model } = props;

    // gets called when this route is navigated to

    return (
        // https://preactjs.com/guide/v10/api-reference#h--createelement
        // https://blog.francium.tech/react-js-advance-guide-cheat-sheet-403cf7ff6f82
        // https://reactjs.org/docs/react-api.html
        // https://reactjs.org/docs/react-without-jsx.html
        h(
            'div',
            null,
            h('ViewPremiums',
                { user: 'Finn', model: initModel },
                null)
        )

        // <div>
        //     <ViewPremiums />
        // </div>
    );
};

export default Profile;
