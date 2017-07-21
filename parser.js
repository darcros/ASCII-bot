const trim = require("trim");

function getStartEnd(string, toFind) {
  /*
  this part finds the start of the option by searching every possible option name in the string
  */
  //for each option toFind
  for (let i in toFind) {
    if (toFind.hasOwnProperty(i)) {
      let option = toFind[i];
      //for each name of the option
      for (let j = 0; j < option.names.length; j++) {
        let name = option.names[j];
        //if the name is in the string (the index isn't -1)
        let regexp1 = new RegExp(`-${name}( |:)`, "i");
        let start = string.search(regexp1);
        if (start !== -1) {

          /*
          this part finds the end of the option by finding the next option
          */
          //for each option to find
          for (let x in toFind) {
            if (toFind.hasOwnProperty(x) && x !== i) { //if the option is not the same as before
              let optionEnd = toFind[x];
              //for each name of the option
              for (let y = 0; y < optionEnd.names.length; y++) {
                let nameEnd = optionEnd.names[y];
                //if the name is in the string (the index isn't -1)
                let regexp2 = new RegExp(`-${nameEnd}( |:)`, "i");
                let end = string.search(regexp2);
                if (end !== -1) {
                  //return the start and the end
                  return {
                    found: true,
                    start: start,
                    end: end,
                    option: i, // this is the key of the option
                    name: name //this is the name, not the key of the option object
                  }
                }
              }
            }
          }
          //if there isn't a second option, end = end of the string
          return {
            found: true,
            start: start,
            end: string.length,
            option: i,
            name: name
          }

        }
      }
    }
  }
  //if all loops are complete an nothing has been found
  //return false
  return {
    found: false
  }
}

function getOptionsArray(string, toFind) {
  let workingString = string;
  let options = [];

  do {
    //get the start and the end of the forst option found
    var startEnd = getStartEnd(workingString, toFind); //this has to be var (and not let) because of scoping, the while() needs to acces this variable 
    //take the option from the string
    let option = workingString.substring(startEnd.start, startEnd.end);
    //push it in the array
    options.push({
      option: startEnd.option,
      name: startEnd.name,
      string: option
    });
    //remove the found option from the string
    workingString = workingString.replace(option, "");
  } while (startEnd.found);

  return options;
}

module.exports = function parse(string, toFind) {
  let optionsArray = getOptionsArray(string + " ", toFind); //added " " to avoid bugs with regex that only matches " " or ":", but not word ending

  let parsedObj = {};
  optionsArray.forEach( (currenOption) => {
    let option = currenOption.option === undefined ? "text" : currenOption.option;
    let val = option === "text" ? trim(currenOption.string) : (toFind[option].needsValue ? trim(currenOption.string.replace("-" + currenOption.name + ":", "")) : true);
    parsedObj[option] = val
  });

  return parsedObj;
}