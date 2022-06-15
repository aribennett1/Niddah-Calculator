function main() {
var today = new Date();
var sevenDaysAgo = addDays(today, -7);
var eventsToday = CalendarApp.getDefaultCalendar().getEvents(sevenDaysAgo, today);
for (var i = 0; i < eventsToday.length; i++) {
  var title =  eventsToday[i].getTitle().toLowerCase();
  var color = eventsToday[i].getColor();
  if ( title == "day period" && color != "2") {
    var periodDate = eventsToday[i].getStartTime();
    createDayVestBainonis(periodDate);
    createDayVestHachodesh(periodDate);
    createDayVestHaflaga(periodDate, "Day Period");
    eventsToday[i].setColor("2");
    Logger.log(`Finished "Day Period"`);    
  }
  if (title == "night period" && color != "2") {
    var periodDate = eventsToday[i].getStartTime();
    createNightVestBainonis(periodDate);
    createNightVestHachodesh(periodDate);
    createNightVestHaflaga(periodDate, "Night Period");
    eventsToday[i].setColor("2");
    Logger.log(`Finished "Night Period"`);    
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
    var sevenDaysFromNow = addDays(today, 7);
    var hefsekEvents = CalendarApp.getDefaultCalendar().getEvents(sevenDaysAgo, sevenDaysFromNow);
    for (var j = 0; j < hefsekEvents.length; j++) {
    var hefsekTitle = hefsekEvents[j].getTitle();
    if (hefsekTitle == "Remove Hefsek Tahara" || hefsekTitle.substring(0, 8) == "Bedika #" || hefsekTitle == "Hefsek Tahara" || hefsekTitle == "Mikvah Night") {
      hefsekEvents[j].deleteEvent();
        }
     }
     Logger.log(`Finished Removing Events`);
   }
  }
}

function createDayVestBainonis(_Date) {
  var title = "Vest Bainonis";
  var startDay = addDays(_Date, 29).setHours(6);
  var endDay = addDays(_Date, 29).setHours(18);
  CalendarApp.getDefaultCalendar().createEvent(`Day ${title}`, new Date(startDay), new Date(endDay));  
  createNightOhrZaruah(startDay, title);
  createDayVestBedikos(startDay, title);
  Logger.log(`Created "Day Vest Bainonis"`);
}

function createDayVestHachodesh(_Date) {
var title = "Vest Hachodesh";
var vhDate = calcVHac(_Date);
var startDay = vhDate.setHours(6);
var endDay = vhDate.setHours(18);
  CalendarApp.getDefaultCalendar().createEvent(`Day ${title}`, new Date(startDay), new Date(endDay));
  createNightOhrZaruah(startDay, title);
  createDayVestBedikos(startDay, title);
  Logger.log(`Created "Day Vest Hachodesh"`);
}

function createDayVestHaflaga(_Date, nightOrDay) {
  var title = "Vest Haflaga";
  var interval = calcVHaf(_Date, nightOrDay);
  console.log("Interval: ",interval);
  if (interval > 3) {
  var startDay = addDays(_Date, interval).setHours(6);
  var endDay = addDays(_Date, interval).setHours(18);
  CalendarApp.getDefaultCalendar().createEvent(`Day ${title} (${interval} days)`, new Date(startDay), new Date(endDay));
  createNightOhrZaruah(startDay, title);
  createDayVestBedikos(startDay, title);
  Logger.log(`Created "Day Vest Haflaga"`);
  }
}

function createNightOhrZaruah(_Date, title) {
  var startDay = addDays(_Date, -1).setHours(18);
  var endDay = addDays(_Date, 0).setHours(6);
  CalendarApp.getDefaultCalendar().createEvent(`Night Ohr Zaruah (Day ${title})`, new Date(startDay), new Date(endDay));
  Logger.log(`Created "Night Ohr Zaruah"`);
}

function createDayVestBedikos(_Date, title) {
  var startDay = addDays(_Date, 0).setHours(7);
  var endDay = addDays(_Date, 0).setHours(9);
  CalendarApp.getDefaultCalendar().createEvent(`1st (Morning) Bedika (${title})`, new Date(startDay), new Date(endDay));
  startDay = addDays(_Date, 0).setHours(21);
  endDay = addDays(_Date, 0).setHours(23);
  CalendarApp.getDefaultCalendar().createEvent(`2nd (Night) Bedika (${title})`, new Date(startDay), new Date(endDay));
  Logger.log(`Created "Two Day-Vest Bedikos"`);
}

//NIGHT! For night, enter the period on the calender as being the day before, so if period was on Halachic Wedndeday Night, still put it on Tuesday Night (Wednesday Night will be halachichly Thursday, and will be day 2 of the count)

function createNightVestBainonis(_Date) {
  var title = "Vest Bainonis";
  var startDay = addDays(_Date, 29).setHours(18);
  var endDay = addDays(_Date, 30).setHours(6);
  CalendarApp.getDefaultCalendar().createEvent(`Night ${title}`, new Date(startDay), new Date(endDay));
  createDayOhrZaruah(startDay, title);
  createNightVestBedikos(startDay, title);
  Logger.log(`Created "Night Vest Bainonis"`);
}

function createNightVestHachodesh(_Date) {
  var title = "Vest Hachodesh";
var vhDate = calcVHac(_Date);
var startDay = vhDate.setHours(18);
var endDay = vhDate.setHours(30);
  CalendarApp.getDefaultCalendar().createEvent(`Night ${title}`, new Date(startDay), new Date(endDay));
  createDayOhrZaruah(startDay, title);
  createNightVestBedikos(startDay, title);
  Logger.log(`Created "Night Vest Hachodesh"`);
}

function createNightVestHaflaga(_Date, nightOrDay) {
  var title = "Vest Haflaga";
  var interval = calcVHaf(_Date, nightOrDay);
  if (interval > 3) {
  var startDay = addDays(_Date, interval - 1).setHours(18);
  var endDay = addDays(_Date, interval).setHours(6);
  CalendarApp.getDefaultCalendar().createEvent(`Night ${title} (${interval} days)`, new Date(startDay), new Date(endDay));
  createDayOhrZaruah(startDay, title);
  createNightVestBedikos(startDay, title);
  Logger.log(`Created "Night Vest Haflaga"`);
  }
}

function createDayOhrZaruah(_Date, title) {
  var startDay = addDays(_Date, 0).setHours(6);
  var endDay = addDays(_Date, 0).setHours(18);
  CalendarApp.getDefaultCalendar().createEvent(`Day Ohr Zaruah (Night ${title})`, new Date(startDay), new Date(endDay));
  Logger.log(`Created "Day Ohr Zaruah"`);
}

function createNightVestBedikos(_Date, title) {
  var startDay = addDays(_Date, 0).setHours(21);
  var endDay = addDays(_Date, 0).setHours(23);
  CalendarApp.getDefaultCalendar().createEvent(`1st (Night) Bedika (${title})`, new Date(startDay), new Date(endDay));
  startDay = addDays(startDay, 1).setHours(7);
  endDay = addDays(endDay, 1).setHours(9);
  CalendarApp.getDefaultCalendar().createEvent(`2nd (Morning) Bedika (${title})`, new Date(startDay), new Date(endDay));
  Logger.log(`Created "Two Night-Vest Bedikos"`);
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
Logger.log("Created 14 Bedika events");
}

function calcShekiyah(_Date) {
  var englishYearMonthDay = getYearMonthDay(_Date);
  var url = `https://www.hebcal.com/zmanim?cfg=json&zip=21209&date=${englishYearMonthDay[0]}-${englishYearMonthDay[1]}-${englishYearMonthDay[2]}`;
  var response = UrlFetchApp.fetch(url).getContentText();  
  response = response.substring(response.indexOf("sunset"));
  response = response.substring(response.indexOf("T") + 1);
  console.log(response);
  var hour = response.substring(0, 2);
  var minute = response.substring(3, 5);
  var second = response.substring(6, 8);
  // console.log(`hour: ${hour}, minute: ${minute}, second: ${second}`);
  month--;
  var shekiyah = new Date(year, month, day, hour, minute, second);
  return shekiyah;
}

function calcVHaf(_Date, nightOrDay) {
var prevPeriodTime = "Not yet set";
var prevPeriod = today;
var startDay = addDays(today, -45);
var endDay = addDays(today, -3);
var prevEvents = CalendarApp.getDefaultCalendar().getEvents(startDay, endDay);
  for (var i = 0; i < prevEvents.length; i++) {
      if (prevEvents[i].getTitle() == "Day Period" ||  prevEvents[i].getTitle() == "Night Period") {        
        prevPeriod = prevEvents[i].getStartTime();
        prevPeriodTime = prevEvents[i].getTitle();
      }      
    }  
 var diffTime = Math.abs(prevPeriod - _Date); 
 var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 if (prevPeriodTime == "Day Period" && nightOrDay == "Night Period") {
        diffDays++;
      }
console.log("diffDays: ", diffDays);
  return diffDays + 1;
}

function calcVHac(_Date) {
  var englishYearMonthDay = getYearMonthDay(_Date);
  var url = `https://www.hebcal.com/converter?cfg=json&gy=${englishYearMonthDay[0]}&gm=${englishYearMonthDay[1]}&gd=${englishYearMonthDay[2]}&g2h=1`;
  var response = UrlFetchApp.fetch(url).getContentText();
  var hebrewYear = response.substring(response.indexOf(`"hy":`) + 5, response.indexOf(`,"hm":`));
  var hebrewMonth = response.substring(response.indexOf(`"hm":"`) + 6, response.indexOf(`","hd":`));
  hebrewMonth = getNextHebrewMonth(hebrewMonth);
  var hebrewDay = response.substring(response.indexOf(`"hd":`) + 5, response.indexOf(`,"hebrew":`));
  if (hebrewDay.toString().length != 2) {
    hebrewDay = "0" + hebrewDay;
  }
  if (hebrewMonth == "Tishrei") {
    var hebrewYearInt = parseInt(hebrewYear);
    hebrewYearInt++;
    hebrewYear = hebrewYearInt.toString();
  }
  url = `https://www.hebcal.com/converter?cfg=json&hy=${hebrewYear}&hm=${hebrewMonth}&hd=${hebrewDay}&h2g=1`;
  response = UrlFetchApp.fetch(url).getContentText();
  console.log("here: " + response);
  var vhYear = response.substring(response.indexOf(`"gy":`) + 5, response.indexOf(`,"gm":`));
  var vhMonth = response.substring(response.indexOf(`"gm":`) + 5, response.indexOf(`,"gd":`))
  vhMonth = parseInt(vhMonth);
  vhMonth--;
  var vhDay = response.substring(response.indexOf(`"gd":`) + 5, response.indexOf(`,"afterSunset"`));
  return new Date(vhYear, vhMonth, vhDay);
}

function getNextHebrewMonth(month) {
  var months = ["Nisan", "Iyyar", "Sivan", "Tamuz", "Av", "Elul", "Tishrei", "Cheshvan", "Kislev", "Tevet", "Shvat", "Adar", "Adar1", "Adar2"];
  if (month == "Shvat") {
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

function getYearMonthDay(_Date) {
  var year = _Date.getFullYear();
  var month = _Date.getMonth() + 1;
  if (month.toString().length != 2) {
    month = "0" + month;
  }
  var day = _Date.getDate();
  if (day.toString().length != 2) {
    day = "0" + day;
  }
  return [year, month, day];
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
