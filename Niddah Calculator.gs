
/*For night, enter the period on the calender as being the day before, so if period was on Halachic Wedndeday Night, still put it on Tuesday Night (Wednesday Night will be halachichly Thursday, and will be day 2 of the count)*/
var eventsCreated = 0;
var removedEvents = 0;
async function main() {  
  var today = new Date();
  var tenDaysAgo = addDays(today, -10);
  var eventsToday = CalendarApp.getDefaultCalendar().getEvents(tenDaysAgo, today);
  for (const event of eventsToday) {
    var title = event.getTitle().toLowerCase();
    var color = event.getColor();
    if ((title == "day period" || title == "night period") && color != "2") {
      await deleteTriggers();
      title == "day period" ? title = "Day" : title = "Night";
      var periodDate = event.getStartTime();
      createVestBainonis(periodDate, title);
      createVestHachodesh(periodDate, title);
      createVestHaflaga(periodDate, title);
      event.setColor("2");
      console.log(`Finished "${title} Period"`);
      await createTrigger();      
    }
    if (title == "hefsek tahara" && color != "2") {
      await deleteTriggers();
      var hefsekDate = event.getStartTime();
      create14Bedikos(hefsekDate);
      var mikNightStart = addDays(hefsekDate, 7).setHours(6, 0);
      var mikNightEnd = addDays(hefsekDate, 7).setHours(18, 0);
      createEvent("Mikvah Night", new Date(mikNightStart), new Date(mikNightEnd), true);
      event.setColor("2");
      console.log(`Finished "Hefsek Tahara"`);
      await createTrigger(); 
    }
    if (title == "remove hefsek tahara") {
      await deleteTriggers();
      var eightDaysFromNow = addDays(today, 8);
      var htEvents = CalendarApp.getDefaultCalendar().getEvents(tenDaysAgo, eightDaysFromNow);
      htEvents.forEach(htEvent => {
        var hefsekTitle = htEvent.getTitle().toLowerCase();
        if (hefsekTitle == "remove hefsek tahara" || hefsekTitle.substring(0, 8) == "bedika #" || hefsekTitle == "hefsek tahara" || hefsekTitle == "mikvah night") {
          removedEvents++;
          htEvent.deleteEvent();
        }
      });
      await createTrigger();
    }
    if (title == "remove vests") {
      await deleteTriggers();
      var _150DaysFromNow = addDays(today, 150);
      var vestEvents = CalendarApp.getDefaultCalendar().getEvents(event.getAllDayStartDate(), _150DaysFromNow);
      vestEvents.forEach(vestEvent => {
        var hefsekTitle = vestEvent.getTitle().toLowerCase();
        if (hefsekTitle.toLowerCase() == "remove vests" || hefsekTitle.toLowerCase().includes("vest haflaga") || hefsekTitle.toLowerCase().includes("placy") || hefsekTitle.toLowerCase().includes("vest hachodesh") || hefsekTitle.toLowerCase().includes("vest bainonis") || hefsekTitle.toLowerCase().includes("chavos daas")) {
          removedEvents++;
          vestEvent.deleteEvent();
        }
      });
      await createTrigger();
    }
  };
  
  console.log(`Created ${eventsCreated} events`);
  console.log(`Removed ${removedEvents} Events`);
}

function createVestBainonis(_Date, dORn) {
  var title = "Vest Bainonis";
  deleteEvents(_Date, addDays(_Date, 31), title);
  deleteEvents(_Date, addDays(_Date, 31), "Chavos Daas");
  var startDay, endDay;
  if (dORn == "Day") {
    startDay = addDays(_Date, 29).setHours(6);
    endDay = addDays(_Date, 29).setHours(18);
  } else {
    startDay = addDays(_Date, 29).setHours(18);
    endDay = addDays(_Date, 30).setHours(6);
  }
  createEvent(`${dORn} ${title}`, startDay, endDay);
  createPlacy(startDay, dORn);
  createEvent("Chavos Daas", addDays(startDay, 1), addDays(endDay, 1));
  createVestBedikos(addDays(startDay, 1), "Chavos Daas", dORn);
  endOfVest(startDay, title, dORn);
}

function createVestHachodesh(_Date, dORn) {
  var title = "Vest Hachodesh";
  var vhDate = calcVHac(_Date);
  var startDay, endDay;
  if (dORn === "Day") {
    startDay = vhDate.setHours(6);
    endDay = vhDate.setHours(18);
  } else {
    startDay = vhDate.setHours(18);
    endDay = vhDate.setHours(30);
  }
  if (createEvent(`${dORn} ${title}`, startDay, endDay)) {
    endOfVest(startDay, title, dORn);
  }
}

function createVestHaflaga(_Date, dORn) {
  var title = "Vest Haflaga";
  var intervals = calcVHaf(_Date, dORn);
  console.log("intervals:" + intervals);
  if (intervals) {
    deleteEvents(_Date, addDays(_Date, intervals[0] + 1), title);
  }
  let startDay, endDay;
  intervals.forEach(interval => {
    const tempTitle = `${title} (${interval} day interval)`;
    if (dORn == "Day") {
      startDay = addDays(_Date, interval - 1).setHours(6);
      endDay = addDays(_Date, interval - 1).setHours(18);
    }
    if (dORn == "Night") {
      startDay = addDays(_Date, interval - 1).setHours(18);
      endDay = addDays(_Date, interval).setHours(6);
    }
    createEvent(`${dORn} ${tempTitle}`, startDay, endDay);
    endOfVest(startDay, tempTitle, dORn);
  });
}

function createPlacy(_Date, dORn) {
  deleteEvents(addDays(_Date, -31), addDays(_Date, 3), "Placy");
  const notDorN = dORn == "Day" ? "Night" : "Day";
  let startDay, endDay;
  if (notDorN === "Day") {
    startDay = addDays(_Date, 1).setHours(6);
    endDay = addDays(_Date, 1).setHours(18);
  } else {
    startDay = addDays(_Date, -1).setHours(18);
    endDay = addDays(_Date, 0).setHours(6);
  }
  createEvent(`${notDorN} Placy`, startDay, endDay);
  createVestBedikos(startDay, "Placy", notDorN);
  console.log(`Created "${notDorN} Placy"`);
}

function endOfVest(startDay, title, dORn) {
  if (!title.includes("Bainonis")) {
    createOhrZaruah(startDay, title, dORn);
  }
  createVestBedikos(startDay, title, dORn);
  console.log(`Created "${dORn} ${title}"`);
}

function createOhrZaruah(_Date, title, dORn) {
  let notDorN, startDay, endDay;
  if (dORn == "Day") {
    notDorN = "Night";
    startDay = addDays(_Date, -1).setHours(18);
    endDay = addDays(_Date, 0).setHours(6);
  }
  if (dORn == "Night") {
    notDorN = "Day";
    startDay = addDays(_Date, 0).setHours(6);
    endDay = addDays(_Date, 0).setHours(18);
  }
  createEvent(`${notDorN} Ohr Zaruah (${dORn} ${title})`, startDay, endDay)
  console.log(`Created "${dORn} Ohr Zaruah"`);
}

function createVestBedikos(_Date, title, dORn) {
  const isVestBainonis = title.includes("Bainonis");
  var beg = isVestBainonis ? "1st Bedika" : "Bedika";

function createBedikaEvent(startHour, endHour, label, daysToAdd = 0) {
    const start = new Date(addDays(_Date, daysToAdd).setHours(startHour));
    const end = new Date(addDays(_Date, daysToAdd).setHours(endHour));
    createEvent(`${label} (${title})`, start, end, true);
  }

  if (dORn === "Day") {
    createBedikaEvent(7, 9, beg);
    if (isVestBainonis) {
      createBedikaEvent(15, 17, "2nd Bedika");
    }
  } else if (dORn === "Night") {
    createBedikaEvent(18, 21, beg);
    if (isVestBainonis) {
      createBedikaEvent(3, 6, "2nd Bedika", 1);
    }
  }
  console.log(isVestBainonis ? `Created "Two ${dORn} ${title} Bedikos"` : `Created "${dORn} ${title} Bedika"`);
}

function deleteEvents(startDay, endDay, title) {
  let futureEvents = CalendarApp.getDefaultCalendar().getEvents(startDay, endDay);
  futureEvents.forEach(event => {
    if (event.getTitle().includes(title)) {
      console.log(`Deleting "${event.getTitle()}" on ${event.getStartTime()}...`);
      event.deleteEvent();
      removedEvents++;
    }
  });
}

function createEvent(title, startDay, endDay, noGuests = false) {
  const calendar = CalendarApp.getDefaultCalendar();
  
  const events = calendar.getEvents(new Date(startDay), new Date(endDay));
  const eventAlreadyCreated = events.some(event => event.getTitle().includes(title));
  
  if (!eventAlreadyCreated) {
     if (noGuests) {
      calendar.createEvent(title, new Date(startDay), new Date(endDay));
    }
    else {
      let event = calendar.createEvent(title, new Date(startDay), new Date(endDay), { guests: "slot700@gmail.com, crosa.wetstein@gmail.com" });
      event.addEmailReminder(1440);
    }
    eventsCreated++;    
    console.log(`Created event "${title}" from ${new Date(startDay)} to ${new Date(endDay)}`);
    return true;
  } else {
    console.log(`Didn't create "${title}", event already present between ${new Date(startDay)} and ${new Date(endDay)}`);
    return false;
  }
}

function create14Bedikos(_Date) {
  var day = 1;
  for (var i = 1; i < 14; i += 2) {
    var startDay = addDays(_Date, day).setHours(7, 0);
    var endDay = addDays(_Date, day).setHours(9, 0);
    createEvent(`Bedika # ${i}`, new Date(startDay), new Date(endDay), true);
    day++;
  }
  day = 1;
  var afternoon = getShekiyah(_Date);
  for (var i = 2; i <= 14; i += 2) {
    var startDay = addDays(afternoon, day);
    startDay = (startDay.getTime() - (30 * 60000));
    var endDay = addDays(afternoon, day);
    createEvent(`Bedika # ${i}`, new Date(startDay), new Date(endDay), true);
    day++;
  }
  console.log("Created 14 Bedika events");
}

function getShekiyah(_Date) {
  var englishYearMonthDay = getYearMonthDay(_Date);
  var response = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/zmanim?cfg=json&zip=21209&date=${englishYearMonthDay[0]}-${englishYearMonthDay[1]}-${englishYearMonthDay[2]}`).getContentText());
  return new Date(response.times.sunset);
}

function calcVHaf(_Date, dORn) {
  var prevPeriodTime = "Not yet set";
  var prevPeriod = _Date;
  var startDay = addDays(_Date, -150);
  var endDay = addDays(_Date, -3);
  var prevEvents = CalendarApp.getDefaultCalendar().getEvents(startDay, endDay);
  prevEvents.forEach(event => {
    var title = event.getTitle().toLowerCase();
    if (title == "day period" || title == "night period") {
      prevPeriod = event.getStartTime();
      prevPeriodTime = title;
      console.log(`prevPeriod: ${prevPeriod}`);
      console.log(`prevPeriodTime: ${prevPeriodTime}`);
    }
  });
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
      if (intervals[num] == diffDays) { console.log(`diffDays (${diffDays}) = ${intervals[num]} interval, exiting loop...`); break; }
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
    if (intervals.length == 0) { intervals.push(diffDays); }
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

async function deleteTriggers() {
  return new Promise((resolve) => {
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
    console.log(`Deleted ${triggers.length} triggers`)
    resolve();
  });
}

async function createTrigger() {
  if (ScriptApp.getProjectTriggers().length > 1) {
    await deleteTriggers();
  }
  if (ScriptApp.getProjectTriggers().length == 0) {
    ScriptApp.newTrigger('main').forUserCalendar("[Calendar email]").onEventUpdated().create();
    console.log("Created trigger");
  }
}
