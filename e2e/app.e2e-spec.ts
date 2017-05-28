import { HojaDeVidaPage } from './app.po';

describe('hoja-de-vida App', () => {
  let page: HojaDeVidaPage;

  beforeEach(() => {
    page = new HojaDeVidaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
