import { inheritInnerComments, mixedTypeAnnotation } from '@babel/types';
// import { render } from 'enzyme';
import { Attributes, Component, ComponentChild, ComponentChildren, FunctionalComponent, h, Ref, JSX } from 'preact';
// import { useEffect, useState } from 'preact/hooks';
import style from './style.css';

import { Provider, connect } from 'unistore/preact';
import createStore from 'unistore';

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

const initModel: State = {
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

let store: any = createStore({ model: initModel });

function setInitialState(): { model: State } {
    return { model: initModel }
}

function setErrorState(errorMessage: string): { model: State } {
    let resultModel: State = initModel;
    resultModel.success = false;
    resultModel.appState = "error";
    resultModel.errorMessage = errorMessage;
    resultModel.userMessage = "Ups something went wrong.";
    return { model: resultModel }
}

function setChoiceYears(years: number): { model: State } {
    let { model: resultModel } = store.getState();
    resultModel.success = true;
    resultModel.appState = "gotChoice";
    resultModel.errorMessage = undefined;
    resultModel.userMessage = "Good choice";
    resultModel.choiceYears = years;
    if (resultModel.allPremiums) {
        resultModel.bestOption = cheapestOption(resultModel.allPremiums, years);
        resultModel.totalSavings = savings(resultModel.allPremiums, years, resultModel.bestOption);
        resultModel.costPerYear = averageCost(resultModel.allPremiums, years, resultModel.bestOption);
    }
    return { model: resultModel }
}

function setFetchingPremiums(): { Model: State } {
    let resultModel: State = initModel;
    resultModel.success = true;
    resultModel.appState = "fetchingPremiums";
    resultModel.errorMessage = undefined;
    resultModel.userMessage = "Fetching premiums";
    return { Model: resultModel }
}

function setGotPremiums(premiums: Premiums): { model: State } {
    let resultModel: State = initModel;
    resultModel.success = true;
    resultModel.appState = "gotPremiums";
    resultModel.errorMessage = undefined;
    resultModel.allPremiums = premiums;
    resultModel.userMessage = "Here are the possible premiums";
    return { model: resultModel }
}

function setOfferAccepted(): { model: State } {
    let { model: resultModel } = store.getState();
    resultModel.success = true;
    resultModel.appState = "gotAccept";
    resultModel.errorMessage = undefined;
    resultModel.userMessage = "Thank You!";
    return { model: resultModel }
}

// interface Actions {
//     loadPremiums() : State;
// }

// const actions: Actions = (store: any) => ({

const actions = (store: any) => ({

    loadPremiums: () => {
        let url: string = "http://localhost:3000/premiums";
        fetch(url, {
            method: 'GET', // default
        })
            .then(response => response.json())
            .then(function(data: any): void {
                let myPremiums: Premiums = formatPremiums(data);
                let newState = setGotPremiums(myPremiums);
                store.setState(newState);
            })
            .catch(function(error: string): void {
                let newState = setErrorState("Check your internet and try again.");
                store.setState(newState);
            })
    },

    // setChoiceYears(years: number): () => {
    //     let newState = setChoiceYears(years);
    //     store.setState({Model: newState});
    // },

});

// https://www.youtube.com/watch?v=hipFdyhhdTg

export interface Premium {
    id: number;
    deductible: number;
    premium: number;
    saved: number;
}

export type Premiums = Premium[];

const MySelect = connect('state', actions) (
    ({ model, setChoiceYears }): h.JSX.Element => (
        <form onSubmit={(value) => setChoiceYears(value)}>
            <p>The cheapest solution for you dependes on ...</p>
            <p>how often do you think an accident might happen?</p>
            <select class={style.select} onInput={(value) => setChoiceYears(value)}>
            <option value="1">One accident every year</option>
            <option value="2">One accident every two years</option>
            <option value="3">One accident every three years</option>
            <option value="4">One accident every four years</option>
            <option value="5">One accident every five years</option>
            </select>
            <button class={style.button} type="submit">Submit choice</button>
        </form>
    )
)


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


const MyChoice = connect('state', actions) (
    ({ model, setOfferAccepted }): h.JSX.Element => (
        <div>
            <p>
                Option {model.bestOption} is the best choice for you.
            </p>
            <p>
                You will save {model.totalSavings.toLocaleString('da-DK')} kr. over {model.years} years compared to option 1.
            </p>
            <p>
                Your cost will be {model.costPerYear.toLocaleString('da-DK')} kr. in average per month over the next three years.
            </p>
            <button class={style.button} type="submit" onClick={(setOfferAccepted)}>Sounds good to me</button>
            <button class={style.buttonCancle} type="submit">Let me think about it</button>
        </div>
    )
)

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

const MyPremiums = connect('state', actions) (
    ({ model, loadPremiums }): h.JSX.Element => (
        <div class={style.profile}>
            <h1>Get your personalized offer now.</h1>
            <p>We will help you choose the right premium and deductibel for your car insurance.</p>

            <p>As you know the higher the deductibe, the lower is the premium, but ...</p>
            <p>which premium and deductible will be the cheapest for you in the long run?</p>

            <p>
                <button class={style.button} onClick={loadPremiums}>Get an offer</button> {model.userMessage}.
            </p>

            <div>
                <table class={style.table}>
                    <tr>
                        <th>#</th>
                        <th>Yearly Premium</th>
                        <th>Deductible in case of an accident</th>
                        {/* <th>Saved</th> */}
                    </tr>
                    {model.allPremiums.map((p: Premium, index: number) => (
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

            <MySelect />
            <MyChoice />
        </div>
    )
);

const Profile: FunctionalComponent = (props) => {
    return (
        <Provider store={store}>
            <MyPremiums />
        </Provider>
    );
};

export default Profile;

function reportPremiums(where: string, premiums: Premiums): void {
    console.log(where + " ----------------------------");
    console.log("     id, deductible, premium, saved");
    premiums.forEach((e) => {
        console.log("data: " + e.id + ",     " + e.deductible + ",   " + e.premium + ",   " + e.saved);
    });
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
