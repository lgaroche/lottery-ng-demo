import { GamePage } from './app.po';

describe('game App', () => {
  let page: GamePage;

  beforeEach(() => {
    page = new GamePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
