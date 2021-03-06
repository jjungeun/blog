---
title: 버블정렬
date: "2019-12-31T23:46:37.121Z"
thumbnail: ./bubblesort.png
descripttion: "bubble sort"
tags: ["algorithm","java"]
---

끝의 요소부터 두개씩 비교하여 정렬하는 방식이다.

```n + (n-1) + (n-2) + ... + 1 = n(n-1)/2 ```번의 비교가 일어난다.

코드는 다음과 같다.

```
static void bubbleSort(int[] arr) {
    int len = arr.length;
    for (int i = 0; i < len - 1; i++) {
      for (int j = len - 1; j > i; j--) {
        if (arr[j - 1] > arr[j]) {
          swap(arr, j - 1, j);
        }
      }
    }
}

static void swap(int[] arr, int idx1, int idx2) {
    int tmp = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = tmp;
}
```



여기서 교환횟수를 측정하면 알고리즘을 개선할 수 있다. 이 전의 패스에서 교환횟수가 0이면 그 이후에서도 교환이 일어나지 않을 것을 알 수 있으므로 반복문을 끝내면 된다.

```
static void bubbleSort(int[] arr) {
    int len = arr.length;
    for (int i = 0; i < len - 1; i++) {
      int chg = 0;
      for (int j = len - 1; j > i; j--) {
        if (arr[j - 1] > arr[j]) {
          swap(arr, j - 1, j);
          chg++;
        }
      }
      if(chg == 0) break;
    }
}
```



여기서 마지막 교환 인덱스를 활용하면 알고리즘을 더 개선할 수 있다. 예를들어 {1,2,5,4,3}의 경우, 처음 루프실행 때 2번 인덱스에서 마지막 교환이 일어난 후엔 교환이 더이상 일어나지 않는다. 이 경우엔  다음엔 3번 인덱스까지만 비교하면 된다.

```
static void bubbleSort(int[] arr) {
  int len = arr.length;
  int k = 0;									// arr[k] 이전은 정렬이 되어있는 상태
  while (k < len - 1) {
    int last = len - 1;
    for (int j = len - 1; j > k; j--) {
      if (arr[j - 1] > arr[j]) {
        swap(arr, j - 1, j);
        last = j;
      }
    }
    k = last;
  }
}
```



마지막으로, {5,1,2,3,4} 배열의 경우, 위의 알고리즘은 빠른시간안에 정렬을 마칠 수 없다. 왜냐하면 맨 앞의 5는 한번의 루프에 한번씩만 뒤로가기 때문이다. 따라서 홀수번째 패스때는 가장 작은 요소를 맨 앞으로 옮기고 짝수번째 패스때는 가장 큰 요소를 뒤로 옮기면 적은 비교로 정렬을 할 수 있다. 이런 방식을 **양방향 버블 정렬**이라고 한다.

```
static void bubbleSort4(int[] arr) {
  int last = arr.length - 1;
  int first = 0;
  int turn = 0;
  while (first < last) {
    if (turn % 2 == 0) {
      for (int j = first + 1; j < last; j++) {
        if (arr[j - 1] > arr[j]) {
          swap(arr, j - 1, j);
        }
      }
      last--;
    } else {
      for (int j = last; j > first; j--) {
        if (arr[j - 1] > arr[j]) {
          swap(arr, j - 1, j);
        }
      }
      first++;
    }
    turn++;
  }
}
```

