import { Component } from '@angular/core';
import { NewsMessage } from '../../shared/models/NewsMessage.model'

@Component({
  selector: 'public-website-news',
  templateUrl: './news.component.html'
})
export class NewsComponent {
  public newsMessage: NewsMessage = new NewsMessage();
}
