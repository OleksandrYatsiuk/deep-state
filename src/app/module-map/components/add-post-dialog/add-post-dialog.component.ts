import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EPost } from 'src/app/core/enums/post.enum';
import { Post } from 'src/app/core/interfaces/post.interface';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-add-post-dialog',
  templateUrl: './add-post-dialog.component.html',
  styleUrls: ['./add-post-dialog.component.scss']
})
export class AddPostDialogComponent implements OnInit {
  form: FormGroup;
  types: SelectItem[];

  constructor(
    private _formBuilder: FormBuilder,
    private _config: DynamicDialogConfig,
    private _postService: PostsService,
    private _ref: DynamicDialogRef
  ) { }

  ngOnInit(): void {
    this._initForm();

    this.types = [
      { label: EPost.Telegram, value: EPost.Telegram },
      { label: EPost.Facebook, value: EPost.Facebook },
      { label: EPost.Twitter, value: EPost.Twitter, disabled: true },
      { label: EPost.Custom, value: EPost.Custom, disabled: true },
    ];
  }

  onSavePost() {

    this.form.markAllAsTouched();
    if (this.form.valid) {
      this._postService.queryCreatePost(this.territoryId, this.form.value)
        .subscribe((post) => {
          this._ref.close(post);
        });
    }

  }

  private _initForm(post?: Post): void {
    this.form = this._formBuilder.group({
      territory: [post?.territory || this.territoryId, []],
      type: [post?.type || EPost.Telegram, []],
      link: [post?.link || '', []],
    })
  }

  get territoryId(): string {
    return this._config.data?.territoryId;
  }

}
