"use strict";

/*
TODO: keep header in fixed position as bottom scrolls

*/

class App {
  constructor() {
    this.regionNames = 'Volcano,Desert,Ice,Forest'.split`,`;
    this.regionSymbols = ['\u{1f30b}', '\u{1f335}', '\u{1f976}', '\u{1f332}'];
    this.itemList = "fire,youth,spear,tag,blade,team,drake,aide,lord,slope,depot,cacao,dart,cash,enemy,corn,chalk,brace,vodka,pit,beet,pay,group,usher,lad,bark,means,toot,owl,noun,pecan,query,belt,chip,tower,plow,lyre,cone,fate,feast,equal,envy,crop,giant,inbox,feel,stalk,yoga,down,eaves,color,guess,hit,epoxy,mix,stick,rider,cube,nuke,shop,class,prow,prior,flat,spine,fob,gun,wrap,manor,ore,right,inn,verb,swamp,cot,pain,fish,bead,tour,wheat,price,taco,yoyo,pupa,slash,song,pole,kitty,jeep,dump,deed,match,novel,bake,spell,toy,dozen,start,crate,lava,sand,perch,birch,oil,purse,uncle,cow,mass,leek,perp,snack,boar,fawn,seal,scene,wok,orchid,sheet,top,shore,tap,radar,text,prose,hire,ear,chap,drama,syrup,mud,kazoo,past,age,body,share,west,dog,treat,habit,wharf,wit,tenet,bread,depth,wave,whale,talk,fig,asset,turf,shed,lag,trout,upper,aside,craw,beach,glass,tale,finer,canal,blog,topic,loaf,kale,gold,info,claw,storm,need,hop,chaos,genre,tweet,lark,hide,maple,cap,chin,yam,wind,louse,aim,back,adobe,gown,smog,spud,dwell,floor,dune,grace,goat,owner,grill,front,aid,sash,tuber,pyramid,frost,icing,bulk,hill,venom,wine,clank,towel,skin,lieu,fold,meat,boot,level,derby,wheel,brood,short,bend,brand,jump,grin,cycle,bun,scope,wear,hold,glue,latte,stone,math,coat,purr,raft,pun,white,bug,wrong,wreck,slide,sprag,guava,torte,dryer,canoe,hobby,curl,yolk,fill,hope,slaw,mover,month,dip,coil,drive,light,chasm,pearl,pig,mango,media,drain,tune,madam,taste,dime,blast,paint,gnat,spot,roar,sail,film,panda,sill,dance,ham,pimp,pizza,hunt,kilt,tempo,bet,wifi,grain,net,rug,actor,hint,crow,brick,cub,mint,spite,potty,lily,glen,humor,snow,leaf,ferry,lipid,pad,pen,wild,yard,final,pupil,bath,waist,kite,elver,link,opera,unity,cello,clamp,wage,dare,put,grey,stand,troop,hound,merit,bride,thump,air,movie,puma,arrow,fund,bidet,row,poker,break,eye,heir,park,sonar,birth,cross,glee,hose,sense,niece,lane,cabin,monk,lace,fairy,quest,puppy,king,pond,bird,chill,fail,attic,foray,claim,proof,bail,bayou,pork,seed,basin,jack,print,hug,tub,hub,graft,liver,vest,lung,gem,donut,sari,patty,event,chord,wish,poem,stop,squid,oboe,fruit,show,bunch,sushi,mound,twist,south,meal,food,fiber,mark,wood".split`,`;
    this.loadState();
    this.initUI(); 

    setInterval(() => this.tick(), 100);
    setInterval(() => this.saveState(), 10000);
  }

  reset() {
    localStorage.removeItem('regionalRecipes');
    window.location.reload();
  }

  loadState() {
    const rawState = localStorage.getItem('regionalRecipes');

    let cityName = '';
    if (rawState === null) {

      while (cityName === null || cityName.length < 3 || cityName.length > 30) {
        cityName = prompt(`Please name your city with between 3 and 30 characters.\nYou will need to give this name to other people so choose something you don't find embarassing.`);
      }

      alert(`You have created ${cityName}, a member of the ${this.regionNames[this.nameToRegion(cityName)]} region!`);
    }

    this.state = {
      cityName: cityName,
      region: this.nameToRegion(cityName),
      cash: 0,
      reqCount: 10,
      sellRate: 1,
      baseRate: 1,
      buildMult: 1,
      itemStates: [],
      consumedImports: {},
      exportPrompt: 1
    };

    if (rawState !== null) {
      const loadedState = JSON.parse(rawState);

      this.state = {...this.state, ...loadedState};
    } else {
      this.itemList.forEach( (v, i) => {
        const itemState = {
          count: 0,
          rate: 0
        };
        this.state.itemStates.push(itemState);
      });

      this.state.itemStates[this.state.region * 100].rate = 1;
    }


    this.itemInfo = [];

    this.itemList.forEach( (v, i) => {
      const itemRegion = Math.floor(i / 100);
      const localIndex = i % 100;
      let requirements = [];
      /*
        0 => none
        1 - 5 => same region, previous item
        6 - 20 => next region, previous item
        21 - 65 => next 2 regions, previous item
        66 - 75 => next 2 regions, previous 2 items
        76 - 90 => next 3 regions, previous item
        91 - 99 => next 3 regions, previous 2 items
      */
      if (itemRegion === this.state.region) {
        if (localIndex > 0) {
          requirements.push(itemRegion * 100 + localIndex - 1);
        }
        if (localIndex > 5) {
          requirements.push(((itemRegion + 1) % 4) * 100 + localIndex - 1);
        }
        if (localIndex > 20) {
          requirements.push(((itemRegion + 2) % 4) * 100 + localIndex - 1);
        }
        if (localIndex > 65) {
          requirements.push(((itemRegion + 1) % 4) * 100 + localIndex - 2);
          requirements.push(((itemRegion + 2) % 4) * 100 + localIndex - 2);
        }
        if (localIndex > 75) {
          requirements.push(((itemRegion + 3) % 4) * 100 + localIndex - 1);
        }
        if (localIndex > 90) {
          requirements.push(((itemRegion + 3) % 4) * 100 + localIndex - 2);
        }      
      }

      const itemInfo = {
        requirements: requirements,
        value: Math.ceil(Math.pow(10, localIndex))
      }

      this.itemInfo.push(itemInfo);
    });

    for (let i = 0; i < 400; i++) {
      if (this.state.itemStates[i].count === null) {
        this.state.itemStates[i].count = Infinity;
      }
      if (this.state.itemStates[i].count < 0) {
        this.state.itemStates[i].count = 0;
      }
      if (this.state.itemStates[i].rate === null) {
        this.state.itemStates[i].rate = Infinity;
      }
    }

    this.saveState();
  }

  saveState() {
    const saveString = JSON.stringify(this.state);
    localStorage.setItem('regionalRecipes', saveString);
  }

  nameToRegion(cityName) {
    return cityName.split``.reduce( (acc, e, i) => acc ^ e.charCodeAt(0), 0xa5 ) % 4;
  }

  createElement(type, id, parent, classes, text) {
    const e = document.createElement(type);
    e.id = id;
    if (id in this.UI) {
      throw `attempt to recreate element with id ${id}`;
    }

    this.UI[id] = e;

    if (parent !== undefined) {
      parent.appendChild(e);
    }

    if (text !== undefined) {
      e.innerText = text;
    }

    if (classes !== undefined && classes.length > 0) {
      classes.split`,`.forEach( className => {
        e.classList.add(className);
      });
    }

    return e;
  } 

  initUI() {
    this.UI = {};

    //setup infoContainer
    document.getElementById('cityName').innerText = this.state.cityName;
    document.getElementById('regionName').innerText = this.regionNames[this.state.region];
    document.getElementById(`imgr${this.state.region}`).classList.add('regionImg');

    'cash,reqCount,sellRate,buildMult,baseRate'.split`,`.forEach( v => {
      this.UI[v + 'Val'] = document.getElementById(v + 'Val');

      if (v !== 'cash') {
        this.UI[v + 'Cost'] = document.getElementById(v + 'Cost');
        this.UI[v + 'Btn'] = document.getElementById(v + 'Btn');
        this.UI[v + 'Btn'].onclick = () => this.buyUpgrade(v);
      }
    });

    this.drawUpgradeDisplay();

    document.getElementById('btnImport').onclick = () => this.doImport;
    document.getElementById('importText').onpaste = () => setTimeout(app.doImport.bind(app), 100);
    document.getElementById('helpOpen').onclick = () => this.showHelp();
    document.getElementById('helpClose').onclick = () => this.hideHelp();
    document.getElementById('reset').onclick = () => this.guiReset();

    //save misc elements
    'exportText,importText,confirmCheck'.split`,`.forEach( id => {
      this.UI[id] = document.getElementById(id);
    });

    //setup region containers
    const allRegionsContainer = document.getElementById('regionsContainer');
    for (let i = 0; i < 4; i++) {
      const container = this.createElement('div', `region${i}Container`, allRegionsContainer, 'regionContainer');
      const regionLabel = this.createElement('div', `region${i}Label`, container, 'regionLabel', `${this.regionSymbols[i]}${this.regionNames[i]} region items`);
      const ul = this.createElement('ul', `region${i}List`, container, 'regionUL');
      const li = this.createElement('li', `region${i}ItemHeader`, ul, 'regionLI');

      //create region header
      'Name,Count,Sell,Pause,Export'.split`,`.forEach( v => {
        const text = i === this.state.region ? v : (v === 'Export' ? '' : v);
        const headerElement = this.createElement('span', `region${i}ItemHeader${v}`, li, 'itemHeader', text);
      });

      for (let j = 0; j < 100; j++) {
        const li = this.createElement('li', `region${i}Item${j}Container`, ul, 'regionLI');
        const itemNameString = this.itemList[i * 100 + j];
        const itemName = this.createElement('span', `region${i}Item${j}Name`, li, 'itemName', itemNameString);
        itemName.title = `value: ${this.formatNumber(this.itemInfo[i * 100 + j].value)} rate: ${this.formatNumber(this.state.itemStates[i * 100 + j].rate)}`;
        const itemCount = this.createElement('span', `region${i}Item${j}Count`, li, 'itemCount');
        this.drawItemCount(i, j, i * 100 + j);
        const itemSell = this.createElement('input', `region${i}Item${j}Sell`, li, 'itemSell');
        itemSell.type = 'checkbox';
        itemSell.title = `sell ${itemNameString}`;
        const itemPause = this.createElement('input', `region${i}Item${j}Pause`, li, 'itemPause');
        itemPause.type = 'checkbox';
        itemPause.title = `pause ${itemNameString}`;


        if (i === this.state.region) {
          li.onmouseover = () => this.highlightRequirements(i * 100 + j);

          const itemExport = this.createElement('button', `region${i}Item${j}Upgrade`, li, 'itemExport', 'Export');
          itemExport.onclick = () => this.exportItem(i, j);
        }
      }
    }

  }

  highlightRequirements(itemNum) {
    const itemList = this.itemInfo[itemNum].requirements;
    
    //unhighlight everything
    const currentItems = document.getElementsByClassName('itemHighlight');
    while (currentItems.length > 0) {
      currentItems.item(0).classList.remove('itemHighlight');
    }
    const currentReqs = document.getElementsByClassName('reqHighlight');
    while (currentReqs.length > 0) {
      currentReqs.item(0).classList.remove('reqHighlight');
    }

    //highlight item
    const itemRegion = Math.floor(itemNum / 100);
    const itemIndex = itemNum % 100;
    this.UI[`region${itemRegion}Item${itemIndex}Container`].classList.add('itemHighlight');

    //highlight list
    itemList.forEach( v => {
      const region = Math.floor(v / 100);
      const localIndex = v % 100;
      this.UI[`region${region}Item${localIndex}Container`].classList.add('reqHighlight');
    });
  }

  encode(key, plainText) {
    const result = plainText.split``.map( (v, i) => {
      const ptv = v.charCodeAt(0);
      const ktv = key.charCodeAt(i % key.length);
      const etv = ptv ^ ktv;
      return String.fromCharCode(etv);
    }).join``;

    return btoa(result);
  }

  decode(key, encodedText) {
    const result = atob(encodedText).split``.map( (v, i) => {
      const etv = v.charCodeAt(0);
      const ktv = key.charCodeAt(i % key.length);
      const ptv = etv ^ ktv;
      return String.fromCharCode(ptv);
    }).join``;

    return result;
  }

  drawItemCount(region, localIndex, itemIndex) {
    this.UI[`region${region}Item${localIndex}Count`].innerText = this.formatNumber(Math.floor(this.state.itemStates[itemIndex].count));
  }

  tick() {
    if (this.lastTick === undefined) {
      this.lastTick = new Date();
      return;
    }
    const curTime = new Date();
    const deltaTime = (curTime - this.lastTick) / 1000; //in seconds

    for (let region = 0; region < 4; region++) {
      for (let localIndex = 0; localIndex < 100; localIndex++) {
        const itemIndex = region * 100 + localIndex;

        if (region === this.state.region) {
          const reqs = this.itemInfo[itemIndex].requirements;
          if (!this.UI[`region${region}Item${localIndex}Pause`].checked) {
            if (reqs.length > 0) {
              //TODO: handle delta time here
              const minReq = Math.floor(reqs.map(v => this.state.itemStates[v].count).reduce( (acc, e) => Math.min(acc, e) ));
              if (minReq >= this.state.reqCount) {
                //const buildCount = Math.min(this.state.maxBuild, Math.floor(minReq / this.state.reqCount));
                const buildCount = Math.floor(minReq / this.state.reqCount);
                if (this.state.itemStates[itemIndex].count < Infinity) {
                  this.state.itemStates[itemIndex].count += buildCount * this.state.buildMult;
                }
                this.drawItemCount(region, localIndex, itemIndex);

                reqs.forEach( v => {
                  if (this.state.itemStates[v].count < Infinity) {
                    this.state.itemStates[v].count -= buildCount * this.state.reqCount;
                  }
                  this.drawItemCount(Math.floor(v / 100), v % 100, v);
                });
              }
            } else {
              if (this.state.itemStates[itemIndex].count < Infinity) {
                this.state.itemStates[itemIndex].count += this.state.itemStates[itemIndex].rate * deltaTime;
              }
              this.drawItemCount(region, localIndex, itemIndex);
            }
          }
          //if enabled, sell item
          if (this.UI[`region${region}Item${localIndex}Sell`].checked) {
            const sellCount = Math.min(this.state.itemStates[itemIndex].count, deltaTime * this.state.sellRate);
            const sellValue = this.itemInfo[itemIndex].value * sellCount;
            this.state.cash += sellValue;

            if (this.state.itemStates[itemIndex].count < Infinity) {
              this.state.itemStates[itemIndex].count -= sellCount;
            }
            this.drawItemCount(region, localIndex, itemIndex);
          }

        } else {
          if (!this.UI[`region${region}Item${localIndex}Pause`].checked) {
            this.state.itemStates[itemIndex].count += this.state.itemStates[itemIndex].rate * deltaTime;
            this.drawItemCount(region, localIndex, itemIndex);
          }
          if (this.UI[`region${region}Item${localIndex}Sell`].checked) {
            const sellCount = Math.min(this.state.itemStates[itemIndex].count, deltaTime * this.state.sellRate);
            const sellValue = this.itemInfo[itemIndex].value * sellCount;
            this.state.cash += sellValue;

            this.state.itemStates[itemIndex].count -= sellCount;
            this.drawItemCount(region, localIndex, itemIndex);
          }
        }
      }
    }

    this.UI.cashVal.innerText = this.getCashSymbol() + this.formatNumber(Math.floor(this.state.cash));
    this.updateUpgradeButtonStates();

    this.lastTick = curTime;
  }

  updateUpgradeButtonStates() {
    'reqCount,sellRate,buildMult,baseRate'.split`,`.forEach( v => {
        const cost = this.getCost(v);
        this.UI[v + 'Btn'].disabled = cost > this.state.cash;
    });
  }

  drawUpgradeDisplay() {
    'cash,reqCount,sellRate,buildMult,baseRate'.split`,`.forEach( v => {
      this.UI[v + 'Val'].innerText = this.formatNumber(Math.floor(this.state[v]));
      
      if (v !== 'cash') {
        const cost = this.formatNumber(this.getCost(v));
        this.UI[v + 'Cost'].innerText = this.getCashSymbol() + cost;
      }
    });
  }

  getCost(upgradeName) {
    const curLevel = this.state[upgradeName];
    return {
      reqCount: (l) => {return l <= 1 ? Infinity : Math.pow(10 * 3, 10 - l)},
      sellRate: (l) => {return Math.pow(10 * 2, l)},
      buildMult: (l) => {return Math.pow(100 * 3, Math.log2(l))},
      baseRate: (l) => {return Math.pow(10, Math.log2(l))},
    }[upgradeName](curLevel);
  }

  buyUpgrade(upgradeName) {
    const cost = this.getCost(upgradeName);
    if (this.state.cash >= cost) {
      this.state.cash -= cost;

      const curLevel = this.state[upgradeName];
      this.state[upgradeName] = {
        reqCount: (l) => l - 1,
        sellRate: (l) => l + 1,
        buildMult:(l) => l * 2,
        baseRate: (l) => {const result = l * 2; this.state.itemStates[this.state.region * 100].rate = result; return result;}
      }[upgradeName](curLevel);

      this.drawUpgradeDisplay();
    
    }
  }

  exportItem(region, localIndex) {
    //export text looks like: ["cityname", "itemname", "code"]
    //code is "itemIndex,count,cityname,nonce" encoded with name

    const itemIndex = region * 100 + localIndex;
    const itemName = this.itemList[itemIndex];
    const itemCount = this.formatNumber(Math.floor(this.state.itemStates[itemIndex].count));

    let doExport = true;
    if (!this.UI.confirmCheck.checked) {
      doExport = confirm(`Are you sure you want to export ${itemCount} x ${itemName}? They will be removed from your inventory.`);
    }

    if (!doExport) { return; }

    const nonce = Math.floor(Math.random() * 0xFFFFFFFF);
    const code = this.encode(this.state.cityName, `[${nonce},${itemCount},${itemIndex}]`);
    if (itemCount < Infinity) {
      this.state.itemStates[itemIndex].count = 0;
    }

    this.drawItemCount(region, localIndex, itemIndex);

    const exportString = `["${this.state.cityName}","${itemName}","${code}"]`;

    this.UI.exportText.value = exportString;
    this.UI.exportText.select();
    this.UI.exportText.setSelectionRange(0, 99999);
    document.execCommand('copy');
  }

  exportItemForce(region, localIndex, itemCount) {
    //export text looks like: ["cityname", "itemname", "code"]
    //code is "nonce,count,ItemIndex" encoded with name

    const itemIndex = region * 100 + localIndex;
    const itemName = this.itemList[itemIndex];

    const nonce = Math.floor(Math.random() * 0xFFFFFFFF);
    const code = this.encode(this.state.cityName, `[${nonce},${itemCount},${itemIndex}]`);
 
    return `["${this.state.cityName}", "${itemName}", "${code}"]`;
  }

  doImport() {
    const importString = this.UI.importText.value;
    this.importItem(importString);
    this.UI.importText.value = '';
  }

  importItem(importString) {
    try {
      const importArray = JSON.parse(importString);
      //didn't parse an array
      if (!Array.isArray(importArray)) {
        throw "ERR";
      }

      //didn't parse an array with exactly 3 elements, all of which are strings
      if (importArray.length !== 3 || typeof importArray[0] !== 'string' || typeof importArray[1] !== 'string' || typeof importArray[2] !== 'string') {
        throw "ERR";
      }

      const [icity, iitem, icode] = importArray;
      //the item name isn't in the list
      if (this.itemList.indexOf(iitem) === -1) {
        throw "ERR";
      }

      //imported this code before
      if (this.state.consumedImports[icode] === 1) {
        throw "ERR";
      }

   
      let pt = this.decode(icity, icode);
      pt = pt.replace('Infinity', 'null');
      const importArray2 = JSON.parse(pt);

      //TODO: add more checking to make sure the input is valid
      let [inonce, icount, iindex] = importArray2;
      if (icount === null) {
        icount = Infinity;
      }
      const iregion = Math.floor(iindex / 100);
      const ilocalIndex = iindex % 100;
      if (iregion === this.state.region) {
        //importing from your region increases your count
        this.state.itemStates[iindex].count += icount;
      } else {
        //importing from other regions increases the rate 
        this.state.itemStates[iindex].rate += icount;
        this.UI[`region${iregion}Item${ilocalIndex}Name`].title = `value: ${this.formatNumber(this.itemInfo[iindex].value)} rate: ${this.formatNumber(this.state.itemStates[iindex].rate)}`;
      }

      this.drawItemCount(iregion, ilocalIndex, iindex);

      this.state.consumedImports[icode] = 1;

      const itemName = this.itemList[iindex];
      if (!this.UI.confirmCheck.checked) {
        alert(`Successfully imported ${icount} x ${itemName}!`);
      }

    } catch (error) {
      alert(`Unable to import string "${importString}". Expected something like '["city","item","code"]' or this code has already been imported.`);
    }
  }

  formatNumber(n) {
    if (n < 1000) {return n};
    return n.toExponential(3);
  }

  getCashSymbol() {
    return this.regionSymbols[this.state.region];
  }

  showHelp() {
    document.getElementById('helpDiv').style.display = 'block';
  }

  hideHelp() {
    document.getElementById('helpDiv').style.display = 'none';
  }

  guiReset() {
    if (confirm('Are you sure you want to reset all progress?')) {
      if (confirm("Are you SURE you're SURE that you want to reset all progress? (last chance! THIS IS NOT A PRESTIGE!)")) {
        this.reset();
      }
    }
  }
}

const app = new App();
