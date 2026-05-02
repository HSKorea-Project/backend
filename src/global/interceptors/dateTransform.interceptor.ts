import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class DateTransFormInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => this.transformDates(data))
        );
    }

    private transformDates(object: any): any{
        // 값 자체가 Date면 -> +9시간
        if (object instanceof Date){
            return new Date(object.getTime() + 9 * 60 * 60 * 1000);
        }
        // 배열이면 각 요소마다 + 9시간
        if (Array.isArray(object)){
            return object.map(item => this.transformDates(item));
        }
        // 일반 객체면 각 value마다 재귀 호출
        if (object && typeof object === 'object'){
            return Object.fromEntries(
                Object.entries(object).map(([k, v]) => [k, this.transformDates(v)])
            );
        }
        // string이나 number면 나머지 그대로 반환
        return object;
    }
}