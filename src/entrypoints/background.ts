export default defineBackground(() => {
  // background logic

  console.log('Hello background!', { id: browser.runtime.id });
});
