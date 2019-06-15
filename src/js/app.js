/*eslint-disable */
import * as THREE from 'three-full';
import Solar from './solar';
import { TweenLite, TimelineLite } from 'gsap';



let PlanetsData;
let Planets = [];
let solar;

fetch('../planets.json').then((resp) => {
    return resp.json();
}).then((data) => {
    PlanetsData = data;
    main();
});

function main() {
    solar = new Solar();
    solar.init(PlanetsData);
    initPlanetsMenu();
}


let planetNameDOM = document.querySelector('.planet-name__item_disactive');
let planetNameActiveDOM = document.querySelector('.planet-name__item_active');
let aboutPlanetNameDOM = document.querySelector('.about-planet__planet-name');
let planetDistanceFromSunDOM = document.querySelector('.planet-data__fromSun');
let planetRadiusDOM = document.querySelector('.planet-data__radius');
let aboutPlanetDOM = document.querySelector('.about-planet__text');
let midSideDOM = document.querySelector('.mid-side');
let planetDataDOM = document.querySelector('.planet-data');
let uiContainerDOM = document.querySelector('.ui-container');
let photoDOM = document.querySelector('.control-button_photo');
let pauseDOM = document.querySelector('.control-button_pause');

let planetFromListDOM = document.querySelector('.planet-menu__item')
let backToSunDOM = document.querySelector('.top-side__back')

let planetListDOM = document.querySelector('.planet-menu__list');

let decriptionTl = new TimelineLite();
let dataTl = new TimelineLite();

planetListDOM.addEventListener('click', function (e) {
    let planetName = e.target.innerHTML;
    solar.setCameraView(planetName);
})
backToSunDOM.addEventListener('click', () => {
    solar.setCameraView("Sun");
})

function initPlanetsMenu() {
    let pl;
    for (pl in PlanetsData) {
        let item = document.createElement('div')
        item.classList.add('planet-menu__item')
        item.innerHTML = PlanetsData[pl].name;
        console.log(item);
        planetListDOM.appendChild(item);
    }
}


function changePlanet(e) {
    let planetName = e.detail.name;

    console.log(PlanetsData[planetName])

    aboutPlanetNameDOM.innerHTML = "about " + planetName.toUpperCase();

    let planetNameDOM = document.querySelector('.planet-name__item_disactive');
    let planetNameActiveDOM = document.querySelector('.planet-name__item_active');
    planetNameDOM.innerHTML = planetName;

    TweenLite.to(planetNameActiveDOM, 1, {
        y: "120%", autoAlpha: 0, onComplete: () => {
            planetNameActiveDOM.classList.toggle("planet-name__item_disactive")
            planetNameActiveDOM.classList.toggle("planet-name__item_active")
        }
    });

    TweenLite.to(planetNameDOM, 1, {
        y: "0%", autoAlpha: 1, onComplete: () => {
            TweenLite.set(planetNameActiveDOM, { y: "-120%", autoAlpha: 0 });
            planetNameDOM.classList.toggle("planet-name__item_disactive")
            planetNameDOM.classList.toggle("planet-name__item_active")
        }
    });

    decriptionTl.to(midSideDOM, 0.5, {
        autoAlpha: 0, y: 35, onComplete: () => {
            aboutPlanetDOM.innerHTML = PlanetsData[planetName].dicription;
            TweenLite.set(midSideDOM, { y: -35 })
        }
    });
    decriptionTl.to(midSideDOM, 0.5, { autoAlpha: 1, y: 0 })

    dataTl.to(planetDataDOM, 0.5, {
        autoAlpha: 0, y: 35, onComplete: () => {
            planetDistanceFromSunDOM.innerHTML = PlanetsData[planetName].distanceFromSun + " a.u";
            planetRadiusDOM.innerHTML = PlanetsData[planetName].radius + " km";
            TweenLite.set(planetDataDOM, { y: -35 })
        }
    })
    dataTl.to(planetDataDOM, 0.5, { autoAlpha: 1, y: 0 });
}

function pauseScene() {
    if (solar.state != "pause")
        solar.state = "pause";
    else
        solar.state = "play";
}

let strDownloadMime = "image/octet-stream";
function saveAsImage() {
    let imgData, imgNode;

    try {
        let strMime = "image/jpeg";
        imgData = solar.RENDERER.domElement.toDataURL(strMime);

        let fileName
        if (solar.selectedObject) {
            fileName = solar.selectedObject.name + ".jpg"
        }
        else {
            fileName = "Solar System.jpg"
        }

        saveFile(imgData.replace(strMime, strDownloadMime), fileName);

    } catch (e) {
        console.log(e);
        return;
    }

}

function saveFile(strData, filename) {
    let link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
}

window.addEventListener('changePlanet', changePlanet);
photoDOM.addEventListener('click', saveAsImage)
pauseDOM.addEventListener('click', pauseScene)