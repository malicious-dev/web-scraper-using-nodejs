let url = 'https://github.com/topics'
let request = require('request')
let cheerio = require('cheerio')
let fs = require('fs')
const path = require('path')

request(url, cb)

function cb(error, response, html) {
  if (error) {
    console.log(error)
  } else if (response.statusCode == 404) {
    console.log('Page Not Found')
  }else {
    extractHtml(html)
  }
}

function extractHtml(html) {
  let selectorTool = cheerio.load(html)
  let topicNameElemArr = selectorTool('.no-underline.d-flex.flex-column.flex-justify-center')
  topicNameElemArr.each(function (i, elem) {
    let topicName = selectorTool(elem).attr('href').split('/').pop()
    let topicLink = 'https://github.com' + selectorTool(elem).attr('href')
    // console.log(topicName, topicLink)
    getRepoPageHtml(topicLink, topicName)
  })
}

function getRepoPageHtml(url, name) {
  request(url, cb)
  function cb(error, response, html) {
    if (error) {
      console.log(error)
    } 
    else if (response.statusCode == 404) {
      console.log('Page Not Found')
    }else {
      extractRepoLinks(html, name)
    }
  }
}

function extractRepoLinks(html, name) {
  let selectorTool = cheerio.load(html)
  let topicNameElemArr = selectorTool('.f3.color-fg-muted.text-normal.lh-condensed')
// console.log(topicNameElemArr('ul li a').attr('href'))
console.log('--------------------------------')
console.log(name)
  topicNameElemArr.each(function (i, elem) {
    const topicName = selectorTool(elem).find('a')
    const link = selectorTool(topicName[1]).attr('href')
    const topicLink = `https://github.com${link}/issues`
    // console.log( link, topicLink)
    getRepoPageHtmlIssus(topicLink, name, topicName)
  })
}

function getRepoPageHtmlIssus(url, name, topicName) {
  request(url, cb)
  function cb(error, response, html) {
    if (error) {
      console.log(error)
    }else if (response.statusCode == 404) {
      console.log('Page Not Found')
    }
     else {
      extractRepoLinksIssues(html, name, topicName)
    }
  }
}

function extractRepoLinksIssues(html, name, topicName) { 
const selectorTool  = cheerio.load(html)
  let topicNameElemArr = selectorTool('.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title')
  let arr=[]
  topicNameElemArr.each(function (i, elem) {
    const topicName = selectorTool(elem).text()
    const link = selectorTool(elem).attr('href')
    const topicLink = `https://github.com${link}`
    console.log(topicName, topicLink)
    arr.push({topicName, topicLink})
  })
  let dirPath = path.join(__dirname, name)
  fs.mkdir(dirPath, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("New Directory created successfully !!");
      
    }
  });
  let filePath = path.join(dirPath,topicName+ 'issues.json')
  fs.writeFileSync(filePath, JSON.stringify(arr))
    
}