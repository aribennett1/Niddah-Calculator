/*For night, enter the period on the calender as being the day before, so if period was on Halachic Wedndeday Night, still put it on Tuesday Night (Wednesday Night will be halachichly Thursday, and will be day 2 of the count)*/
let eventsCreated = 0;
let removedEvents = 0;
let disabledEvents = 0;
async function main() {
  let today = new Date();
  let tenDaysAgo = addDays(today, -10);
  let eventsToday = CalendarApp.getDefaultCalendar().getEvents(tenDaysAgo, today);
  for (const event of eventsToday) {
    const title = event.getTitle().toLowerCase();
    let color = event.getColor();
    if ((title == "day period" || title == "night period") && color != "2") {
      await deleteTriggers();
      let dORn = title == "day period" ? "Day" : "Night";
      const periodDate = event.getStartTime();
      createVestBainonis(periodDate, dORn);
      createVestHachodesh(periodDate, dORn);
      createVestHaflaga(periodDate, dORn);
      await endOfMain(title, event);
    }
    if (title == "hefsek tahara" && color != "2") {
      await deleteTriggers();
      create14Bedikos(event.getStartTime());
      await endOfMain(title, event);
    }
    if (title == "remove hefsek tahara") {
      await deleteTriggers();
      deleteEvents(tenDaysAgo, addDays(today, 8), ["remove hefsek tahara", "bedika #", "hefsek tahara", "mikvah night"]);
      await endOfMain(title);
    }
    if (title == "remove vestos") {
      await deleteTriggers();
      deleteEvents(event.getAllDayStartDate(), addDays(today, 150), ["remove vestos", "vest haflaga", "placy", "vest hachodesh", "vest bainonis", "chavos daas"]);
      await endOfMain(title);
    }
  };
}

async function endOfMain(title, event = null) {
  event?.setColor("2");
  console.log(`Finished "${title}"`);
  await createTrigger();
  console.log(`Created ${eventsCreated} Events`);
  console.log(`Removed ${removedEvents} Events`);
  console.log(`Disabled ${disabledEvents} Events`);
}

function createVestBainonis(_Date, dORn) {
  let title = "Vest Bainonis";
  deleteEvents(_Date, addDays(_Date, 31), [title, "Chavos Daas"]);
  let {startDay, endDay} = setStartDayAndEndDay(_Date, 29, dORn)
  createEvent(`${dORn} ${title}`, startDay, endDay);
  createPlacy(startDay, dORn);
  createEvent("Chavos Daas", addDays(startDay, 1), addDays(endDay, 1));
  createVestBedikos(addDays(startDay, 1), "Chavos Daas", dORn);
  endOfVest(startDay, title, dORn);
}

function createVestHachodesh(_Date, dORn) {
  let title = "Vest Hachodesh";
  let { startDay, endDay } = setStartDayAndEndDay(calcVHac(_Date), 0, dORn);
  if (createEvent(`${dORn} ${title}`, startDay, endDay)) {
    endOfVest(startDay, title, dORn);
  }
}

function createVestHaflaga(_Date, dORn) {
  let title = "Vest Haflaga";
  let intervals = calcVHaf(_Date, dORn);
  if (intervals) {
    deleteEvents(_Date, addDays(_Date, intervals[0] + 1), [title]);
  }
  intervals.forEach(interval => {
    const tempTitle = `${title} (${interval} day interval)`;
    let { startDay, endDay } = setStartDayAndEndDay(_Date, interval - 1, dORn)
    createEvent(`${dORn} ${tempTitle}`, startDay, endDay);
    endOfVest(startDay, tempTitle, dORn);
  });
}

function createPlacy(_Date, dORn) {
  deleteEvents(addDays(_Date, -31), addDays(_Date, 3), ["Placy"]);
  const notDorN = dORn == "Day" ? "Night" : "Day";
  let { startDay, endDay } = setStartDayAndEndDay(_Date, notDorN === "Day" ? 1 : -1, notDorN);
  createEvent(`${notDorN} Placy`, startDay, endDay);
  createVestBedikos(startDay, "Placy", notDorN);
}

function setStartDayAndEndDay(_Date, daysToAdd, dORn) {
  let vestDate = addDays(_Date, daysToAdd);
    if (dORn === "Day") {
      startDay = vestDate.setHours(6);
      endDay = vestDate.setHours(18);
    } else {
      startDay = vestDate.setHours(18);
      endDay = vestDate.setHours(30);
    }
    return { startDay, endDay };
}

function endOfVest(startDay, title, dORn) {
  if (!title.includes("Bainonis")) {
    createOhrZaruah(startDay, title, dORn);
  }
  createVestBedikos(startDay, title, dORn);
}

function createOhrZaruah(_Date, title, dORn) {
  const notDorN = dORn == "Day" ? "Night" : "Day";
  let { startDay, endDay } = setStartDayAndEndDay(_Date, dORn === "Day" ? -1 : 0, notDorN);
  createEvent(`${notDorN} Ohr Zaruah (${dORn} ${title})`, startDay, endDay);
}

function createVestBedikos(_Date, title, dORn) {
  const isVestBainonis = title.includes("Bainonis");
  const beg = isVestBainonis ? "1st Bedika" : "Bedika";

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
}

function deleteEvents(startDay, endDay, titles) {
  let futureEvents = CalendarApp.getDefaultCalendar().getEvents(startDay, endDay);
  futureEvents.forEach(event => {
    let eventTitle = event.getTitle().toLowerCase();
    if (titles.some(title => eventTitle.includes(title.toLowerCase())) && !eventTitle.startsWith("[disabled]")) {
      if (eventTitle.includes("vest ") && !(eventTitle.includes("ohr") || eventTitle.includes("bedika"))) {
        console.log(`Disabling "${event.getTitle()}" on ${event.getStartTime()}...`);
        event.setTitle(`[Disabled] ${event.getTitle()}`);
        event.setColor(CalendarApp.EventColor.GRAY);
        event.getGuestList().map(guest => event.removeGuest(guest.getEmail()));
        disabledEvents++;
      }
      else {
        console.log(`Deleting "${event.getTitle()}" on ${event.getStartTime()}...`);
        event.deleteEvent();
        removedEvents++;
      }
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
      let event = calendar.createEvent(title, new Date(startDay), new Date(endDay), { guests: "[Guests' Emails]" });
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
  let day = 1;
  for (let i = 1; i < 14; i += 2) {
    let startDay = addDays(_Date, day).setHours(7, 0);
    let endDay = addDays(_Date, day).setHours(9, 0);
    createEvent(`Bedika # ${i}`, new Date(startDay), new Date(endDay), true);
    day++;
  }
  day = 1;
  let afternoon = getShekiyah(_Date);
  for (let i = 2; i <= 14; i += 2) {
    let startDay = addDays(afternoon, day);
    startDay = (startDay.getTime() - (30 * 60000));
    let endDay = addDays(afternoon, day);
    createEvent(`Bedika # ${i}`, new Date(startDay), new Date(endDay), true);
    day++;
  }
  createEvent("Mikvah Night", new Date(addDays(_Date, 7).setHours(6, 0)), new Date(addDays(_Date, 7).setHours(18, 0)), true);
  console.log("Created 14 Bedika events & Mikvah Night");
}

function getShekiyah(_Date) {
  const englishYearMonthDay = getYearMonthDay(_Date);
  const response = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/zmanim?cfg=json&zip=21209&date=${englishYearMonthDay[0]}-${englishYearMonthDay[1]}-${englishYearMonthDay[2]}`).getContentText());
  return new Date(response.times.sunset);
}

function calcVHaf(_Date, dORn) {
  let prevPeriodTime = "Not yet set";
  let prevPeriod = _Date;
  const prevEvents = CalendarApp.getDefaultCalendar().getEvents(addDays(_Date, -150), addDays(_Date, -3));
  prevEvents.forEach(event => {
    const title = event.getTitle().toLowerCase();
    if (title == "day period" || title == "night period") {
      prevPeriod = event.getStartTime();
      prevPeriodTime = title;
    }
  });
  console.log(`prevPeriod: ${prevPeriod}`);
  console.log(`prevPeriodTime: ${prevPeriodTime}`);
  if (prevPeriodTime == "night period") addDays(prevPeriod, 1);
  if (dORn == "Night") addDays(_Date, 1);
  const diffDays = Math.ceil(Math.abs(prevPeriod - _Date) / (1000 * 60 * 60 * 24)) + 1;
  console.log("diffDays: ", diffDays);
  let intervals = JSON.parse(PropertiesService.getScriptProperties().getProperty("intervals"));
  console.log("intervals: " + intervals);
  for (let num = intervals.length - 1; num >= 0; num--) {
    if (intervals[num] == diffDays) {
      console.log(`diffDays (${diffDays}) = ${intervals[num]} interval, exiting loop...`);
      break;
    }
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
  PropertiesService.getScriptProperties().setProperty("intervals", JSON.stringify(intervals));
  return intervals;
}

const instantiateIntervals = () => PropertiesService.getScriptProperties().setProperty("intervals", JSON.stringify([0]));

function calcVHac(_Date) {
  const englishYearMonthDay = getYearMonthDay(_Date);
  let response = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/converter?cfg=json&gy=${englishYearMonthDay[0]}&gm=${englishYearMonthDay[1]}&gd=${englishYearMonthDay[2]}&g2h=1`).getContentText());
  let hebrewYear = response.hy;
  const hebrewMonth = getNextHebrewMonth(response.hm);
  const hebrewDay = response.hd.toString().padStart(2, '0');

  if (hebrewMonth === "Tishrei") {
    hebrewYear = parseInt(hebrewYear) + 1;
  }

  response = JSON.parse(UrlFetchApp.fetch(`https://www.hebcal.com/converter?cfg=json&hy=${hebrewYear}&hm=${hebrewMonth}&hd=${hebrewDay}&h2g=1`).getContentText());

  return new Date(response.gy, parseInt(response.gm) - 1, response.gd);
}

function getNextHebrewMonth(month) {
  const months = ["Nisan", "Iyyar", "Sivan", "Tamuz", "Av", "Elul", "Tishrei", "Cheshvan", "Kislev", "Tevet", "Sh'vat", "Adar", "Adar1", "Adar2"];
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
  for (let i = 0; i < 10; i++) {
    if (month == months[i]) {
      return months[i + 1];
    }
  }
}

const getYearMonthDay = (_Date) => [_Date.getFullYear(), String(_Date.getMonth() + 1).padStart(2, '0'), String(_Date.getDate()).padStart(2, '0')];

function addDays(date, days) {
  let result = new Date(date);
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
    ScriptApp.newTrigger('main').forUserCalendar("[Calendar Email]").onEventUpdated().create();
    console.log("Created trigger");
  }
}
