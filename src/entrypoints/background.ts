export default defineBackground(/* async */ () => {
  // background logic

  console.log('Hello background!', { id: browser.runtime.id });
});
