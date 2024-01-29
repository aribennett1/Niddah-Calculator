
/*For night, enter the period on the calender as being the day before, so if period was on Halachic Wedndeday Night, still put it on Tuesday Night (Wednesday Night will be halachichly Thursday, and will be day 2 of the count)*/

function main() {
var today = new Date();
var sevenDaysAgo = addDays(today, -17);
var eventsToday = CalendarApp.getDefaultCalendar().getEvents(sevenDaysAgo, today);
for (var i = 0; i < eventsToday.length; i++) {
  var title =  eventsToday[i].getTitle().toLowerCase();
  var color = eventsToday[i].getColor();
  if ( (title == "day period" || title == "night period") && color != "2") {
    title == "day period" ? title = "Day" : title = "Night";
    var periodDate = eventsToday[i].getStartTime();
    createVestBainonis(periodDate, title);
    createVestHachodesh(periodDate, title);
    createVestHaflaga(periodDate, title);
    eventsToday[i].setColor("2");
    Logger.log(`Finished "${title} Period"`);    
  }
  if (title == "hefsek tahara" && color != "2") {
    var hefsekDate = eventsToday[i].getStartTime();
    create14Bedikos(hefsekDate);
    var mikNightStart = addDays(hefsekDate, 7).setHours(6,0);
    var mikNightEnd = addDays(hefsekDate, 7).setHours(18,0);
    CalendarApp.getDefaultCalendar().createEvent("Mikvah Night", new Date(mikNightStart), new Date(mikNightEnd));
    eventsToday[i].setColor("2");
    Logger.log(`Finished "Hefsek Tahara"`);    
  }
  if (title == "remove hefsek tahara") {
    var removedEvents = 0;
    var eightDaysFromNow = addDays(today, 8);
    var haflagaEvents = CalendarApp.getDefaultCalendar().getEvents(sevenDaysAgo, eightDaysFromNow);
    for (var j = 0; j < haflagaEvents.length; j++) {
    var hefsekTitle = haflagaEvents[j].getTitle().toLowerCase();
    if (hefsekTitle == "remove hefsek tahara" || hefsekTitle.substring(0, 8) == "bedika #" || hefsekTitle == "hefsek tahara" || hefsekTitle == "mikvah night") {
      removedEvents++;
      haflagaEvents[j].deleteEvent();
        }
     }
     Logger.log(`Removed ${removedEvents} Events`);
   }
   if (title == "remove vest haflaga") {
    var removedEvents = 0;
    var _75DaysFromNow = addDays(today, 75);
    var haflagaEvents = CalendarApp.getDefaultCalendar().getEvents(sevenDaysAgo, _75DaysFromNow);
    for (var j = 0; j < haflagaEvents.length; j++) {
    var hefsekTitle = haflagaEvents[j].getTitle().toLowerCase();
    if (hefsekTitle == "remove vest haflaga" || hefsekTitle.toLowerCase().includes("vest haflaga")) {
      removedEvents++;
      haflagaEvents[j].deleteEvent();
        }
     }
     Logger.log(`Removed ${removedEvents} Events`);
   }
  }
}

function createVestBainonis(_Date, dORn) {
  var title = "Vest Bainonis";
  deleteEvents(_Date, addDays(_Date, 31), title);
  deleteEvents(_Date, addDays(_Date, 31), "Chavos Daas");
  if (dORn == "Day") {
  var startDay = addDays(_Date, 29).setHours(6);
  var endDay = addDays(_Date, 29).setHours(18);}
  if (dORn == "Night") {
  var startDay = addDays(_Date, 29).setHours(18);
  var endDay = addDays(_Date, 30).setHours(6);}
  createEvent(`${dORn} ${title}`, startDay, endDay);
  createPlacy(startDay, dORn);
  createEvent("Chavos Daas", addDays(startDay,1), addDays(endDay, 1));
  createVestBedikos(addDays(startDay,1), "Chavos Daas", dORn);
  endOfVest(startDay, title, dORn);
}

function createVestHachodesh(_Date, dORn) {
var title = "Vest Hachodesh";  
var vhDate = calcVHac(_Date);
if (dORn == "Day") {
var startDay = vhDate.setHours(6);
var endDay = vhDate.setHours(18);}
if (dORn == "Night") {
var startDay = vhDate.setHours(18);
var endDay = vhDate.setHours(30);
}
let success = createEvent(`${dORn} ${title}`, startDay, endDay);
if (success) {
endOfVest(startDay, title, dORn);
}
}

function createVestHaflaga(_Date, dORn) {
  var title = "Vest Haflaga";
  var intervals = calcVHaf(_Date, dORn);
  console.log("intervals:" + intervals);
  if (interval != null) {
  deleteEvents(_Date, addDays(_Date, intervals[0] + 1),title);}
  var interval, startDay, endDay, tempTitle;
  for (var num in intervals) {
  interval = intervals[num];
  tempTitle = `${title} (${interval} day interval)`;
 if (dORn == "Day") {
  startDay = addDays(_Date, interval - 1).setHours(6);
  endDay = addDays(_Date, interval - 1).setHours(18);}
  if (dORn == "Night") {
  startDay = addDays(_Date, interval - 2).setHours(18);
  endDay = addDays(_Date, interval - 1).setHours(6);}
  createEvent(`${dORn} ${tempTitle}`, startDay, endDay);
  endOfVest(startDay, tempTitle, dORn);
  }
}

function createPlacy(_Date, dORn) {
  deleteEvents(addDays(_Date, -31), addDays(_Date, 3), "Placy");
  const notDorN = dORn == "Day" ? "Night" : "Day";
  if (notDorN == "Day") {
  var startDay = addDays(_Date, 0).setHours(6);
  var endDay = addDays(_Date, 0).setHours(18);}
  if (notDorN == "Night") {
  var startDay = addDays(_Date, -1).setHours(18);
  var endDay = addDays(_Date, 0).setHours(6);}
  createEvent(`${notDorN} Placy`, startDay, endDay);
  createVestBedikos(startDay, "Placy", notDorN);
  console.log(`Created "${notDorN} Placy"`);
  }

function endOfVest(startDay, title, dORn) {
  if (!title.includes("Bainonis")) {
  createOhrZaruah(startDay, title, dORn);}
  createVestBedikos(startDay, title, dORn);
  console.log(`Created "${dORn} ${title}"`);
}

function createOhrZaruah(_Date, title, dORn) {
  var notDorN;
  if (dORn == "Day") {
    notDorN = "Night";
  var startDay = addDays(_Date, -1).setHours(18);
  var endDay = addDays(_Date, 0).setHours(6);}
  if (dORn == "Night") {
    notDorN = "Day";
  var startDay = addDays(_Date, 0).setHours(6);
  var endDay = addDays(_Date, 0).setHours(18);
  }
  createEvent(`${notDorN} Ohr Zaruah (${dORn} ${title})`, startDay, endDay)
  Logger.log(`Created "${dORn} Ohr Zaruah"`);
}

function createVestBedikos(_Date, title, dORn) {
  var start, end;
  const isVestBainonis = title.includes("Bainonis");
  var beg = isVestBainonis ? "1st Bedika" : "Bedika";
  if (dORn == "Day") {
  start = addDays(_Date, 0).setHours(7);
  end = addDays(_Date, 0).setHours(9);
  CalendarApp.getDefaultCalendar().createEvent(`${beg} (${title})`, new Date(start), new Date(end));
  if (isVestBainonis) {
  start = addDays(_Date, 0).setHours(15);
  end = addDays(_Date, 0).setHours(17);
  CalendarApp.getDefaultCalendar().createEvent(`2nd Bedika (${title})`, new Date(start), new Date(end));}
  }
  if (dORn == "Night") {
  start = addDays(_Date, 0).setHours(18);
  end = addDays(_Date, 0).setHours(21);
  CalendarApp.getDefaultCalendar().createEvent(`${beg} (${title})`, new Date(start), new Date(end));
  if (isVestBainonis) {
  start = addDays(_Date, 1).setHours(3);
  end = addDays(_Date, 1).setHours(6);
  CalendarApp.getDefaultCalendar().createEvent(`2nd Bedika (${title})`, new Date(start), new Date(end));}
  }
  console.log(isVestBainonis ? `Created "Two ${dORn} ${title} Bedikos"` : `Created "${dORn} ${title} Bedika"`);
}

function deleteEvents(startDay, endDay, title) {
  let futureEvents = CalendarApp.getDefaultCalendar().getEvents(startDay, endDay);
  for (var i in futureEvents) {
      if (futureEvents[i].getTitle().includes(title)) {
        console.log(`Deleting "${futureEvents[i].getTitle()}" on ${futureEvents[i].getStartTime()}...`);
        futureEvents[i].deleteEvent();
      }      
    }  
}

function createEvent(title, startDay, endDay) {
  let eventAlreadyCreated = false;
let futureEvents = CalendarApp.getDefaultCalendar().getEvents(new Date(startDay), new Date(endDay));
  for (var i in futureEvents) {
      if (futureEvents[i].getTitle().includes(title)) {
        eventAlreadyCreated = true;
        break;
      }
  }
  if (!eventAlreadyCreated) {
  let event = CalendarApp.getDefaultCalendar().createEvent(title, new Date(startDay), new Date(endDay), {guests: [EMAILS REMOVED]});
  event.addEmailReminder(1440);
  return true;
    }
else {
    console.log(`Didn't create ${title}, event already present on date (${startDay})`);
    return false;
  }
}

function create14Bedikos(_Date) {
  var day = 1;
  for (var i = 1; i < 14; i += 2) {
    var startDay = addDays(_Date, day).setHours(7,0);
    var endDay = addDays(_Date, day).setHours(9,0);
    CalendarApp.getDefaultCalendar().createEvent(`Bedika # ${i}`, new Date(startDay), new Date(endDay));
    day++;
  }
  day = 1;
  var afternoon = calcShekiyah(_Date);
  for (var i = 2; i <= 14; i += 2) {
    var startDay = addDays(afternoon, day);    
    startDay = (startDay.getTime() - (30 * 60000));
    var endDay = addDays(afternoon, day);
    CalendarApp.getDefaultCalendar().createEvent(`Bedika # ${i}`, new Date(startDay), new Date(endDay));
    day++;
  }
console.log("Created 14 Bedika events");
}

function calcShekiyah(_Date) {
  var englishYearMonthDay = getYearMonthDay(_Date);
  var response = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/zmanim?cfg=json&zip=21209&date=${englishYearMonthDay[0]}-${englishYearMonthDay[1]}-${englishYearMonthDay[2]}`).getContentText());
  return new Date(response.times.sunset);
}


function calcVHaf(_Date, dORn) {
var prevPeriodTime = "Not yet set";
var prevPeriod = _Date;
var startDay = addDays(_Date, -120);
var endDay = addDays(_Date, -3);
var prevEvents = CalendarApp.getDefaultCalendar().getEvents(startDay, endDay);
  for (var i = 0; i < prevEvents.length; i++) {
    var title = prevEvents[i].getTitle().toLowerCase();
      if (title == "day period" || title == "night period") {        
        prevPeriod = prevEvents[i].getStartTime();        
        prevPeriodTime = title;
        console.log(`prevPeriod: ${prevPeriod}`);
        console.log(`prevPeriodTime: ${prevPeriodTime}`);
      }      
    }  
 var diffTime = Math.abs(prevPeriod - _Date); 
 var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
 if (prevPeriodTime == "day period" && dORn == "Night") {
        diffDays++;
      }
 if (prevPeriodTime == "night period" && dORn == "Day") {
        diffDays--;
      }
console.log("diffDays: ", diffDays); 
//USE TO RESET INTERVAL ARRAY, COMMENT OUT REST OF FUNCTION
// var intervals = [];
// intervals.push(diffDays);
// intervals = JSON.stringify(intervals);
// PropertiesService.getScriptProperties().setProperty("intervals", intervals);
// console.log("intervals: " + intervals);
if (diffDays > 7) {
var intervals = JSON.parse(PropertiesService.getScriptProperties().getProperty("intervals"));
console.log("intervals: " + intervals);
  for (var num = intervals.length - 1; num >= 0; num--) {
    if (intervals[num] == diffDays) {console.log(`diffDays (${diffDays}) = ${intervals[num]} interval, exiting loop...`); break;}
    if (intervals[num] > diffDays) {
      console.log(`diffDays (${diffDays}) didn't pass ${intervals[num]} interval, adding ${diffDays}...`);      
      intervals.push(diffDays);
      break;
   }
   else {
     console.log(`diffDays (${diffDays}) passed ${intervals[num]} interval, removing ${intervals[num]}...`);     
     intervals.pop();
   }
  }
  if (intervals.length == 0) {intervals.push(diffDays);}
console.log("intervals: " + intervals);
let jintervals = JSON.stringify(intervals);
PropertiesService.getScriptProperties().setProperty("intervals", jintervals);
return intervals;
}
return [];
}

function calcVHac(_Date) {
  var englishYearMonthDay = getYearMonthDay(_Date);
  let response = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/converter?cfg=json&gy=${englishYearMonthDay[0]}&gm=${englishYearMonthDay[1]}&gd=${englishYearMonthDay[2]}&g2h=1`).getContentText());
  var hebrewYear = response.hy;
  var hebrewMonth = getNextHebrewMonth(response.hm);
  var hebrewDay = response.hd.toString().padStart(2, '0');

  if (hebrewMonth === "Tishrei") {
    hebrewYear = parseInt(hebrewYear) + 1;
  }

  response = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/converter?cfg=json&hy=${hebrewYear}&hm=${hebrewMonth}&hd=${hebrewDay}&h2g=1`).getContentText());

  return new Date(response.gy, parseInt(response.gm) - 1, response.gd);
}


function getNextHebrewMonth(month) {
  var months = ["Nisan", "Iyyar", "Sivan", "Tamuz", "Av", "Elul", "Tishrei", "Cheshvan", "Kislev", "Tevet", "Sh'vat", "Adar", "Adar1", "Adar2"];
  if (month == "Sh'vat") {
    return "Adar1";
  }
  if (month == "Adar") {
    return "Nisan";
  }
  if (month == "Adar2") {
    return "Nisan";
  }
  if (month == "Adar1") {
    return "Adar2";
  }
  for (var i = 0; i < 10; i++) {
    if (month == months[i]) {
      return months[i + 1];
    }
  }
}

const getYearMonthDay = (_Date) => [_Date.getFullYear(), String(_Date.getMonth() + 1).padStart(2, '0'), String(_Date.getDate()).padStart(2, '0')];

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
