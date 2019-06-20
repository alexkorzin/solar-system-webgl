/*eslint-disable */
import * as THREE from 'three-full';
import Solar from './solar';
import { TweenLite, TimelineLite } from 'gsap';



let aboutPlanetNameDOM = document.querySelector('.about-planet__planet-name');
let planetDistanceFromSunDOM = document.querySelector('.planet-data__fromSun');
let planetRadiusDOM = document.querySelector('.planet-data__radius');
let aboutPlanetDOM = document.querySelector('.about-planet__text');
let midSideDOM = document.querySelector('.mid-side');
let planetDataDOM = document.querySelector('.planet-data');
let photoDOM = document.querySelector('.control-button_photo');
let pauseDOM = document.querySelector('.control-button_pause');
let hideDOM = document.querySelector('.control-button_hide');

let backToSunDOM = document.querySelector('.top-side__back')
let clickPlanetTipDOM = document.querySelector('.top-side__tip')

let planetListDOM = document.querySelector('.planet-menu__list');

let decriptionTl = new TimelineLite();
let dataTl = new TimelineLite();

let PlanetsData;
let solar;

let preloaderTl = new TimelineLite();
preloaderTl.staggerTo('.staggerToTop', 1, { y: 0, autoAlpha: 1, ease: Power2.easeOut }, 0.1, "+=1")



function init() {
  return new Promise((resolve) => {
    solar = new Solar();
    solar.init(PlanetsData);
    initPlanetsMenu();
    resolve();
  })
}

window.addEventListener('load', () => {

  fetch('./planets.json').then((resp) => {
    return resp.json();
  }).then((data) => {
    PlanetsData = data;
    init().then(() => {
      preloaderTl.staggerTo('.staggerToTop', 1, { y: -150, autoAlpha: 0, ease: Power2.easeOut }, 0.1, "+=1.5");

      preloaderTl.to('.preloader', 1, {
        y: "-100%", ease: Power2.easeOut, onComplete: function () {
          document.querySelector('.preloader').remove();
        }
      });
      preloaderTl.fromTo('.ui-container', 1, { y: "10%", autoAlpha: 0 }, {
        y: "0%", autoAlpha: 1, ease: Power2.easeOut
      }, "-=0.8");
      preloaderTl.addLabel('ui', "-=1.5");

      solar.Planets.forEach((p, i) => {
        preloaderTl.fromTo(p.object.position, 2, { y: -100 }, { y: 0, ease: Power2.easeOut }, "ui+=" + i/100);
      })
    });
  });



})


planetListDOM.addEventListener('click', function (e) {
  let planetName = e.target.innerHTML;
  if (planetName == solar.selectedObject.name) {
    return false
  }
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
    planetListDOM.appendChild(item);
  }
}


function changePlanet(e) {
  let planetName = e.detail.name;


  if (planetName == "Sun") {

    backToSunDOM.classList.toggle("top-side__back_active");
    clickPlanetTipDOM.classList.toggle("top-side__tip_active");

  }

  else {

    if (!backToSunDOM.classList.contains("top-side__back_active")) {
      backToSunDOM.classList.add("top-side__back_active")
    }
    if (clickPlanetTipDOM.classList.contains("top-side__tip_active")) {
      clickPlanetTipDOM.classList.remove("top-side__tip_active");
    }

  }



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
  if (solar.state != "pause") {
    solar.state = "pause";
    pauseDOM.classList.add('control-button_active');
  }
  else {
    solar.state = "play";
    pauseDOM.classList.remove('control-button_active');
  }
}

function hideHUD() {

  if (!hideDOM.classList.contains('control-button_active')) {
    hideDOM.classList.add('control-button_active')
    solar.Planets.forEach(p => {
      let sprite = p.object.children[p.object.children.length - 2];
      if (sprite instanceof THREE.Sprite) {
        sprite.visible = false;
      }
    })
  }
  else {
    solar.Planets.forEach(p => {
      let sprite = p.object.children[p.object.children.length - 2];
      if (sprite instanceof THREE.Sprite) {
        sprite.visible = true;
      }
    })
    hideDOM.classList.remove('control-button_active')
  }

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
hideDOM.addEventListener('click', hideHUD)

