const puppeteer = require("puppeteer");
const log = console.log;

///selector///
// video_title
var video_title_selector = "#video-title";

// 顶
var like_btn_selector = "#like-button";

// 踩
var dislike_btn_selector = "#dislike-button";

// // 回复按钮
var reply_btn_selector = "#reply-button-end";

// 输入框
var contenteditorbox_selector = "#contenteditable-root";

//评论确定按钮
var reply_sub_btn_selector = "#submit-button";

///selector///

//自定评论内容
var reply_content = "";

//Main
(async () => {
  // const browser = await puppeteer.launch();
  // 使用完全版本
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
  );
  // 这里使用cookie来登陆youtube账户
  await page.setCookie();

  await page.goto("https://www.youtube.com");
  // search_input
  const search_input = await page.waitForSelector("#search");
  // type
  await search_input.type("datdrop");
  // search_btn
  const search_btn = await page.waitForSelector(
    "#search-icon-legacy > yt-icon"
  );
  // search_btn_click
  await search_btn.click();
  await page.waitForSelector("#video-title");

  await page.waitForSelector(video_title_selector);

  var video_href = await page.$$eval(video_title_selector, ele =>
    ele.map(a => a.getAttribute("href").trim())
  );
  for (let index = 0; index <= video_href.length; index++) {
    const tempPage = await browser.newPage();
    await tempPage.setUserAgent(
      "Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14"
    );
    await tempPage.goto("https://www.youtube.com" + video_href[index]);
    await tempPage.waitFor(2000);
    // 页面向下滚动
    await tempPage.evaluate(_ => {
      window.scrollBy(0, window.innerHeight);
    });
    await tempPage.waitFor(2000);

    // const video_title = await tempPage.waitForSelector("#eow-title");
    // await video_title.click();
    var m = 2;
    var nomorecomment = false;
    var attempcount = 0;

    while (true) {
      try {
        await tempPage.evaluate(_ => {
          window.scrollBy(0, window.innerHeight);
        });
        await tempPage.waitFor(2000);
        //
        log(m);
        try {
          const reply_btn = await tempPage.waitForSelector(
            `#comment-section-renderer-items > section:nth-child(${m}) > div.comment-renderer.vve-check-visible.vve-check-hidden > div.comment-renderer-content > div.comment-renderer-footer > div.comment-action-buttons-toolbar > button`,
            { timeout: 500 }
          );
          await reply_btn.click();
          // 评论
          const reply_combox = await tempPage.waitForSelector(
            "#comment-simplebox > div.comment-simplebox-frame > div.comment-simplebox-text"
          );
          // 输入评论
          await reply_combox.type(reply_content);
          await tempPage.waitFor(800);
          // 确认评论
          const confirm_btn = await tempPage.waitForSelector(
            "#comment-simplebox > div.comment-simplebox-controls > div.comment-simplebox-buttons > button.yt-uix-button.yt-uix-button-size-default.yt-uix-button-primary.yt-uix-button-empty.comment-simplebox-submit.yt-uix-sessionlink"
          );
          await confirm_btn.click();
          attempcount = 0;
        } catch (error) {
          attempcount++;
          log(">>>>>>>index<<<<<<<", m);
          if (attempcount > 6) {
            await tempPage.close();
            break;
          }
        }

        // 点赞
        // await tempPage.$eval(
        //   `#comment-section-renderer-items > section:nth-child(${m}) > div.comment-renderer.vve-check-visible.vve-check-hidden > div.comment-renderer-content > div.comment-renderer-footer > div.comment-action-buttons-toolbar > span:nth-child(4) > button.yt-uix-button.yt-uix-button-size-default.yt-uix-button-default.yt-uix-button-empty.yt-uix-button-has-icon.no-icon-markup.comment-action-buttons-renderer-thumb.yt-uix-sessionlink.sprite-comment-actions.sprite-like.i-a-v-sprite-like`,
        //   ele => ele.setAttribute("aria-checked", "true")
        // );
        m++;
        await tempPage.waitFor(3000);
        //

        //测试
        //
        try {
          if (nomorecomment == false) {
            const loadmore = await tempPage.waitForSelector(
              "#comment-section-renderer > button > span > span.load-more-text"
            );
            await loadmore.click();
          }
        } catch (error) {
          nomorecomment = true;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
})();
