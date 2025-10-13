import { forwardRef } from 'react';

import { getUpperCaseStartedWord } from '../../utils/functions';
import styles from './Input.module.css';

const Input = forwardRef(
  (
    {
      name = '',
      type = 'text',
      label = '',
      placeholder = '',
      error = '',
      useLabel = true,
      containerClass = '',
      ...props
    },
    ref,
  ) => {
    const labelName = label || getUpperCaseStartedWord(name);

    return (
      <div className={`${(containerClass, styles.inputContainer)}`}>
        {useLabel && (
          <label htmlFor={name} className={styles?.label}>
            {labelName}
          </label>
        )}

        <input
          ref={ref}
          id={name}
          type={type}
          name={name}
          placeholder={placeholder || getUpperCaseStartedWord(name)}
          className={`${styles.input} ${error ? styles.error : ''}  ${props.disabled ? styles.disabled : ''}`}
          {...props}
        />
      </div>
    );
  },
);

export default Input;
