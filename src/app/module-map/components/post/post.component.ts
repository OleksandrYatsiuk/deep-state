import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { filter, Observable } from 'rxjs';
import { EPost } from 'src/app/core/enums/post.enum';
import { Post } from 'src/app/core/interfaces/post.interface';
import { PostsService } from 'src/app/core/services/posts.service';
import { AddPostDialogComponent } from '../add-post-dialog/add-post-dialog.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnChanges {

  @Input() territoryId: string;
  posts$: Observable<Post[]>;
  postType = EPost;
  constructor(
    private _postsService: PostsService,
    private _dialogService: DialogService,
    private _cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.posts$ = this._queryPosts(this.territoryId);
  }

  ngOnInit(): void {
  }

  onAddPost(): void {
    const ref = this._dialogService.open(AddPostDialogComponent, {
      header: 'Додати новину',
      width: '40vw',
      data: { territoryId: this.territoryId }
    });

    ref.onClose.pipe(filter(result => result)).subscribe(() => {
      this.posts$ = this._queryPosts(this.territoryId);
      this._cd.detectChanges();
    });

  }

  private _queryPosts(territoryId?: string): Observable<Post[]> {
    if (territoryId) {
      return this._postsService.queryPosts(territoryId);
    }
    return this._postsService.queryAllPosts();
  }

  encodeURIComponent(link: string): string {
    return encodeURIComponent(link);
  }

}
