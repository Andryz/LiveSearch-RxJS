import { Observable, fromEvent } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

interface InputEvent { target: any };
interface Item { html_url: string, full_name: string };
interface AvatarResponse { items: Item[] };
function ApiFunction(name: string): Promise<object | string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.github.com/search/repositories?q=${" + name + "}", false);
        xhr.onload = res => resolve(JSON.parse((res.currentTarget as any).responseText));
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}
let liveSearch: HTMLInputElement = document.getElementById('live-search') as HTMLInputElement;
const result: HTMLDivElement = document.querySelector('.rep') as HTMLDivElement;
const sequence$: Observable<Event> = fromEvent(liveSearch, 'input');

function ArrayShow(arr) {
    arr.forEach(function (item: Item) {
        const ul: HTMLElement = document.createElement('ul');
        ul.classList.add('list-group');
        result.appendChild(ul);
        const li = document.createElement('li');
        li.innerHTML = `<a href=${item.html_url} target="_blank">${item.full_name}</a>`;
        ul.appendChild(li);
    })
}

sequence$
    .pipe(
        debounceTime(200),
        map((e: InputEvent) => {
            return e.target.value
        }),
        switchMap((str: string) => {
            return ApiFunction(str)
                .then((response: AvatarResponse) => {
                    return response.items
                })
                .catch(error => {
                    console.log("упс")
                    console.log(error);
                })
        })

    )

    .subscribe((value: Item[]) => {
        result.innerHTML = "";
        ArrayShow(value);
    
    });