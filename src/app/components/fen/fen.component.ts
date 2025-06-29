import { ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-fen',
    standalone: true,
    imports: [CommonModule,FormsModule],
    templateUrl: './fen.component.html',
    styleUrls: ['./fen.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FenComponent {
    @Input() fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    @Input() fenChange = new EventEmitter<string>();
}
